(function () {
  "use strict";

  const brandNames = {
    boticario: "O Boticário",
    eudora: "Eudora",
    qdb: "quem disse, berenice?",
    oui: "O.U.i"
  };
  const brandHosts = {
    boticario: "www.boticario.com.br",
    eudora: "www.eudora.com.br",
    qdb: "www.quemdisseberenice.com.br",
    oui: "www.ouiparis.com"
  };
  const $ = id => document.getElementById(id);
  let catalog = { items: [], updatedAt: null, source: null };
  let products = [];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function currentPrice(product) {
    if (typeof product.price !== "number" || product.price <= 0 || product.currency !== "BRL") return null;
    const timestamp = Date.parse(product.priceVerifiedAt || "");
    const age = Date.now() - timestamp;
    return Number.isFinite(timestamp) && age >= 0 && age <= 24 * 60 * 60 * 1000 ? product.price : null;
  }

  function validateCatalog(data) {
    if (!data || !Array.isArray(data.items)) throw new Error("O catálogo não contém uma lista de produtos.");
    const ids = new Set();
    for (const item of data.items) {
      let url;
      try {
        url = new URL(item.productUrl);
      } catch (error) {
        throw new Error("Há um produto sem link oficial válido.");
      }
      if (!item || typeof item.id !== "string" || !item.id.trim() ||
          typeof item.name !== "string" || !item.name.trim() ||
          typeof item.category !== "string" || !item.category.trim() ||
          !brandHosts[item.brand] || url.protocol !== "https:" || url.hostname !== brandHosts[item.brand] ||
          !(item.price === null || (typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0)) ||
          ids.has(item.id)) {
        throw new Error("O catálogo contém um item inválido ou duplicado.");
      }
      ids.add(item.id);
    }
    return data;
  }

  function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function normalized(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  }

  function updateCategoryOptions() {
    const select = $("client-category");
    const selected = select.value;
    const categories = Array.from(new Set(products.map(product => product.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    select.innerHTML = '<option value="">Todas</option>' +
      categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
    if (categories.includes(selected)) select.value = selected;
  }

  function visibleProducts() {
    const query = normalized($("client-search").value.trim());
    const brand = $("client-brand").value;
    const category = $("client-category").value;
    const sort = $("client-sort").value;
    const result = products.filter(product => {
      const text = normalized(`${product.name} ${product.category} ${brandNames[product.brand]}`);
      return (!query || text.includes(query)) &&
        (!brand || product.brand === brand) &&
        (!category || product.category === category);
    });
    if (sort === "price-asc") result.sort((a, b) => (currentPrice(a) ?? Infinity) - (currentPrice(b) ?? Infinity));
    if (sort === "price-desc") result.sort((a, b) => (currentPrice(b) ?? -Infinity) - (currentPrice(a) ?? -Infinity));
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return result;
  }

  function renderProducts() {
    updateCategoryOptions();
    const list = visibleProducts();
    $("client-count").textContent = `${list.length} ${list.length === 1 ? "produto" : "produtos"} nesta seleção`;
    if (!list.length) {
      $("client-grid").innerHTML = '<p class="client-empty">Nenhum produto encontrado. Tente alterar sua busca ou os filtros.</p>';
      return;
    }

    $("client-grid").innerHTML = list.map(product => {
      const price = currentPrice(product);
      const brandLabel = escapeHtml(brandNames[product.brand]);
      const visual = product.image
        ? `<img src="${escapeHtml(product.image)}" alt="" loading="lazy">`
        : window.CASA_FLORA_PRODUCT_ART
          ? window.CASA_FLORA_PRODUCT_ART.render(product)
          : `<span class="client-art-fallback">${escapeHtml(product.brand === "boticario" ? "BOTI" : brandLabel)}</span>`;
      const priceText = price === null
        ? '<p class="client-price">Consulte o preço na loja oficial<small>Preço atual não verificado</small></p>'
        : `<p class="client-price">${formatPrice(price)}<small>Conferido em ${escapeHtml(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(product.priceVerifiedAt)))}</small></p>`;
      return `<article class="client-card">
        <div class="client-visual" data-brand="${escapeHtml(product.brand)}" data-art="${product.image ? "false" : "true"}" aria-hidden="true">${visual}</div>
        <div class="client-info">
          <p class="client-brand">${brandLabel} <span>${escapeHtml(product.category)}</span></p>
          <h2>${escapeHtml(product.name)}</h2>
          ${priceText}
          <a href="${escapeHtml(product.productUrl)}" target="_blank" rel="noopener noreferrer">Ver na loja oficial <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
    }).join("");
  }

  function renderNotice() {
    const updated = catalog.updatedAt
      ? `Atualizado em ${escapeHtml(catalog.updatedAt)}. `
      : "";
    $("client-catalog-notice").innerHTML = `<span aria-hidden="true">✳</span><p>${updated}Esta é uma seleção parcial; não representa todo o catálogo das marcas. Os preços são exibidos somente quando informados em reais e conferidos nas últimas 24 horas. Confirme preço, estoque e condições na loja oficial.</p>`;
  }

  async function loadCatalog() {
    const catalogUrl = window.CASA_FLORA_CONFIG && window.CASA_FLORA_CONFIG.catalogUrl;
    try {
      if (catalogUrl) {
        const url = new URL(catalogUrl, window.location.href);
        if (url.protocol !== "https:" && url.origin !== window.location.origin) {
          throw new Error("O feed remoto precisa usar HTTPS.");
        }
        const response = await fetch(url.href, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        catalog = validateCatalog(await response.json());
      } else {
        catalog = validateCatalog(window.CASA_FLORA_CATALOG);
      }
      products = catalog.items;
      renderNotice();
      renderProducts();
    } catch (error) {
      catalog = { items: [], updatedAt: null, source: null };
      products = [];
      $("client-catalog-notice").textContent = `Não foi possível carregar o catálogo (${error.message}).`;
      renderProducts();
    }
  }

  $("print-catalog").addEventListener("click", () => window.print());
  ["client-search", "client-brand", "client-category", "client-sort"].forEach(id =>
    $(id).addEventListener(id === "client-search" ? "input" : "change", renderProducts));
  loadCatalog();
})();
