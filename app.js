(function () {
  "use strict";

  const brands = [
    { id: "boticario", name: "O Boticário", tagline: "Fragrâncias e cuidados.", url: "https://www.boticario.com.br/" },
    { id: "eudora", name: "Eudora", tagline: "Beleza para revelar sua potência.", url: "https://www.eudora.com.br/" },
    { id: "qdb", name: "quem disse, berenice?", tagline: "Cor, liberdade e expressão.", url: "https://www.quemdisseberenice.com.br/" },
    { id: "oui", name: "O.U.i", tagline: "Fragrâncias e cuidados.", url: "https://www.ouiparis.com/" }
  ];
  let catalog = window.CASA_FLORA_CATALOG || { items: [], updatedAt: null, source: null };
  let products = [];
  const cart = new Map();
  let byId = new Map();
  const $ = id => document.getElementById(id);
  let toastTimer;

  function officialProductUrl(value, brandId) {
    try {
      const url = new URL(value);
      const brand = brands.find(item => item.id === brandId);
      return Boolean(brand && url.protocol === "https:" && url.origin === new URL(brand.url).origin);
    } catch (error) {
      return false;
    }
  }

  function isValidProduct(item) {
    return item && typeof item.id === "string" && item.id.trim() &&
      typeof item.name === "string" && item.name.trim() &&
      brands.some(brand => brand.id === item.brand) &&
      typeof item.category === "string" && item.category.trim() &&
      officialProductUrl(item.productUrl, item.brand) &&
      (item.price === null || (typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0)) &&
      (!item.image || (typeof item.image === "string" && /^https:\/\//i.test(item.image)));
  }

  function validateCatalog(data) {
    if (!data || !Array.isArray(data.items)) throw new Error("O feed precisa conter uma lista \"items\".");
    const ids = new Set();
    for (const item of data.items) {
      if (!isValidProduct(item)) throw new Error("O catálogo contém um produto inválido ou sem link oficial.");
      if (ids.has(item.id)) throw new Error(`ID de produto duplicado: ${item.id}`);
      ids.add(item.id);
    }
    return data;
  }

  function currentPrice(product) {
    if (typeof product.price !== "number" || product.price <= 0 || product.currency !== "BRL") return null;
    const timestamp = Date.parse(product.priceVerifiedAt || "");
    const age = Date.now() - timestamp;
    return Number.isFinite(timestamp) && age >= 0 && age <= 24 * 60 * 60 * 1000 ? product.price : null;
  }

  function setCatalog(data) {
    catalog = validateCatalog(data);
    products = catalog.items.map(item => ({ ...item, currentPrice: currentPrice(item) }));
    byId = new Map(products.map(product => [product.id, product]));
    updateBrandCounts();
    schedulePriceExpiry();
  }

  let priceExpiryTimer;
  function schedulePriceExpiry() {
    window.clearTimeout(priceExpiryTimer);
    const expiries = products
      .filter(product => product.currentPrice !== null)
      .map(product => 24 * 60 * 60 * 1000 - (Date.now() - Date.parse(product.priceVerifiedAt)));
    if (!expiries.length) return;
    priceExpiryTimer = window.setTimeout(() => {
      products = products.map(product => ({ ...product, currentPrice: currentPrice(product) }));
      byId = new Map(products.map(product => [product.id, product]));
      renderProducts();
      renderCart();
      schedulePriceExpiry();
    }, Math.max(1000, Math.min(...expiries) + 1));
  }

  async function loadCatalog() {
    const catalogUrl = window.CASA_FLORA_CONFIG && window.CASA_FLORA_CONFIG.catalogUrl;
    if (!catalogUrl) {
      setCatalog(catalog);
      renderNotice();
      renderProducts();
      renderCart();
      return;
    }

    try {
      const url = new URL(catalogUrl, window.location.href);
      if (url.protocol !== "https:" && url.origin !== window.location.origin) {
        throw new Error("O feed remoto precisa usar HTTPS.");
      }
      const response = await fetch(url.href, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setCatalog(await response.json());
      renderNotice();
      renderProducts();
      renderCart();
    } catch (error) {
      setCatalog({ items: [], updatedAt: null, source: null });
      $("catalog-notice").textContent = `Não foi possível carregar o catálogo configurado (${error.message}). Nenhum preço ou produto demonstrativo será exibido.`;
      renderProducts();
      renderCart();
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function formatPrice(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function productBrand(product) {
    return brands.find(brand => brand.id === product.brand).name;
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function renderBrands() {
    const choices = [{ id: "", name: "Todas as marcas" }, ...brands];
    $("brand-grid").innerHTML = choices.map(brand => `
      <button class="brand-chip" type="button" data-brand="${brand.id}" aria-pressed="${brand.id === ""}">
        ${escapeHtml(brand.name)}
      </button>`).join("");
    $("brand-grid").addEventListener("click", event => {
      const chip = event.target.closest(".brand-chip");
      if (!chip) return;
      $("brand-filter").value = chip.dataset.brand;
      renderProducts();
      $("colecao").scrollIntoView({ behavior: "smooth" });
    });
  }

  function updateBrandCounts() {
    for (const brand of brands) {
      const count = products.filter(product => product.brand === brand.id).length;
      const badge = document.querySelector(`[data-brand-count="${brand.id}"]`);
      if (badge) badge.textContent = `${count} ${count === 1 ? "produto" : "produtos"}`;
    }
  }

  function productMark(brandId) {
    return { boticario: "BOTI", eudora: "EUDORA", qdb: "QDB", oui: "O.U.i" }[brandId];
  }

  function renderNotice() {
    const date = catalog.updatedAt ? `Última atualização informada: ${catalog.updatedAt}.` :
      "Nenhum feed de catálogo foi configurado nesta vitrine.";
    const source = catalog.source ? ` Fonte informada: ${catalog.source}.` : "";
    $("catalog-notice").textContent = `${date}${source} Fonte e data são informadas pelo catálogo e não auditadas por esta vitrine. Produtos e preços não representam o catálogo completo; confirme preço, estoque e condições na loja oficial. Valores só aparecem quando informados em BRL e verificados nas últimas 24 horas.`;
  }

  function visibleProducts() {
    const query = $("search").value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
    const brand = $("brand-filter").value;
    const category = $("category-filter").value;
    const sort = $("sort-filter").value;
    const list = products.filter(product => {
      const brandName = productBrand(product).toLocaleLowerCase("pt-BR");
      const text = `${product.name} ${product.category} ${brandName}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
      return (!query || text.includes(query)) &&
        (!brand || product.brand === brand) &&
        (!category || product.category === category);
    });
    if (sort === "price-asc") list.sort((a, b) => (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity));
    if (sort === "price-desc") list.sort((a, b) => (b.currentPrice ?? -Infinity) - (a.currentPrice ?? -Infinity));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return list;
  }

  function renderProducts() {
    const hasCurrentPrices = products.some(product => currentPrice(product) !== null);
    $("sort-filter").querySelector('[value="price-asc"]').disabled = !hasCurrentPrices;
    $("sort-filter").querySelector('[value="price-desc"]').disabled = !hasCurrentPrices;
    if (!hasCurrentPrices && $("sort-filter").value.startsWith("price-")) $("sort-filter").value = "featured";
    const categories = Array.from(new Set(products.map(product => product.category))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    const selected = $("category-filter").value;
    $("category-filter").innerHTML = '<option value="">Todas as categorias</option>' +
      categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
    if (categories.includes(selected)) $("category-filter").value = selected;

    document.querySelectorAll(".brand-chip").forEach(chip => {
      const active = chip.dataset.brand === $("brand-filter").value;
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
    const list = visibleProducts();
    $("catalog-results").textContent = `${list.length} ${list.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
    if (!list.length) {
      const emptyTitle = products.length ? "Nenhum produto encontrado" : "Sua próxima descoberta começa aqui";
      const emptyText = products.length
        ? "Experimente mudar a busca ou os filtros para encontrar outros produtos."
        : "Nenhum item desta seleção corresponde à busca. A vitrine reúne apenas uma amostra; consulte as lojas oficiais para ver o catálogo completo e confirmar preços e disponibilidade.";
      $("product-grid").innerHTML = `<div class="empty-state"><div class="empty-flower" aria-hidden="true">✿</div><h3>${emptyTitle}</h3><p>${emptyText}</p></div>`;
      return;
    }

    $("product-grid").innerHTML = list.map(product => {
      const image = product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">` :
        window.CASA_FLORA_PRODUCT_ART
          ? window.CASA_FLORA_PRODUCT_ART.render(product)
          : `<span class="product-visual-placeholder" aria-hidden="true"><strong>${productMark(product.brand)}</strong><small>${escapeHtml(product.category)}</small></span>`;
      const price = currentPrice(product);
      const priceLabel = price === null
        ? '<div class="product-price">Consulte o preço na loja oficial<small>Preço atual não verificado</small></div>'
        : `<div class="product-price">${formatPrice(price)}<small>Informado pelo catálogo · conferido em ${escapeHtml(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(product.priceVerifiedAt)))}</small></div>`;
      const purchaseAction = price === null
        ? `<a class="add-button add-link" href="${escapeHtml(product.productUrl)}" target="_blank" rel="noopener noreferrer">Consultar produto e preço ↗</a>`
        : `<a class="product-store-link" href="${escapeHtml(product.productUrl)}" target="_blank" rel="noopener noreferrer">Ver na loja oficial ↗</a><button class="add-button" type="button" data-add="${escapeHtml(product.id)}">Adicionar à sacola</button>`;
      return `<article class="product-card">
        <div class="product-visual" data-brand="${escapeHtml(product.brand)}" data-art="${product.image ? "false" : "true"}">
          ${image}<span class="product-brand-badge">${escapeHtml(productBrand(product))}</span>
        </div>
        <div class="product-info">
          <div class="product-brand">${escapeHtml(productBrand(product))}</div>
          <h3 class="product-name">${escapeHtml(product.name)}</h3>
          <div class="product-meta"><span>${escapeHtml(product.category)}</span>${product.volume ? `<span>${escapeHtml(product.volume)}</span>` : ""}</div>
          ${priceLabel}
          ${purchaseAction}
        </div></article>`;
    }).join("");
  }

  function renderCart() {
    for (const [id] of cart) {
      if (!byId.has(id) || currentPrice(byId.get(id)) === null) cart.delete(id);
    }
    const entries = Array.from(cart.entries()).filter(([id, quantity]) => byId.has(id) && quantity > 0);
    const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
    const total = entries.reduce((sum, [id, quantity]) => sum + byId.get(id).currentPrice * quantity, 0);
    $("bag-count").textContent = count;
    $("cart-items").innerHTML = entries.length ? entries.map(([id, quantity]) => {
      const product = byId.get(id);
      return `<div class="cart-row">
        <strong>${escapeHtml(product.name)}</strong><span class="row-price">${formatPrice(product.currentPrice * quantity)}</span>
        <small>${escapeHtml(productBrand(product))} · ${formatPrice(product.currentPrice)} cada</small>
        <div class="quantity-control"><button type="button" data-quantity="${escapeHtml(id)}" data-step="-1" aria-label="Diminuir quantidade">−</button><span>${quantity}</span><button type="button" data-quantity="${escapeHtml(id)}" data-step="1" aria-label="Aumentar quantidade">+</button></div>
      </div>`;
    }).join("") : '<p class="cart-empty">Sua sacola está esperando por uma descoberta especial.</p>';
    $("cart-summary").innerHTML = `<div class="cart-total"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
      <p class="cart-disclaimer">Sacola demonstrativa. Não processa pagamentos nem confirma estoque ou preço; valide os dados com a loja antes de concluir qualquer compra.</p>
      <button class="review-button" type="button" ${entries.length ? "" : "disabled"}>Revisar pedido</button>`;
  }

  function setCartOpen(open) {
    $("cart-drawer").classList.toggle("is-open", open);
    $("cart-drawer").setAttribute("aria-hidden", String(!open));
    $("cart-drawer").toggleAttribute("inert", !open);
    $("cart-backdrop").hidden = !open;
    document.body.classList.toggle("cart-open", open);
    if (open) $("close-cart").focus();
    else $("open-cart").focus();
  }

  $("product-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    const id = button.dataset.add;
    const product = byId.get(id);
    if (!product || currentPrice(product) === null) {
      showToast("O preço precisa de nova conferência. Consulte a loja oficial.");
      return;
    }
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
    showToast("Adicionado à sua sacola.");
  });
  $("cart-items").addEventListener("click", event => {
    const button = event.target.closest("[data-quantity]");
    if (!button) return;
    const id = button.dataset.quantity;
    const next = (cart.get(id) || 0) + Number(button.dataset.step);
    if (next > 0) cart.set(id, next); else cart.delete(id);
    renderCart();
  });
  ["search", "brand-filter", "category-filter", "sort-filter"].forEach(id =>
    $(id).addEventListener(id === "search" ? "input" : "change", renderProducts));
  $("open-cart").addEventListener("click", () => setCartOpen(true));
  $("close-cart").addEventListener("click", () => setCartOpen(false));
  $("cart-backdrop").addEventListener("click", () => setCartOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && $("cart-drawer").classList.contains("is-open")) setCartOpen(false);
  });
  $("cart-summary").addEventListener("click", event => {
    if (event.target.closest(".review-button")) {
      showToast("Este protótipo não finaliza compras. Confirme preços, estoque e condições diretamente com a loja.");
    }
  });
  $("year").textContent = new Date().getFullYear();
  renderBrands();
  loadCatalog();
})();
