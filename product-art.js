(function () {
  "use strict";

  const palettes = {
    boticario: [
      ["#d3b88f", "#eee1cb", "#65745d", "#8d7256"],
      ["#c1d0c4", "#e7eee6", "#506950", "#6a806e"],
      ["#caa38e", "#f0e2d7", "#8a6351", "#945e51"],
      ["#c3c4a8", "#ecebd8", "#696c4d", "#85815b"],
      ["#c9b8cf", "#eee8f0", "#71627b", "#897491"]
    ],
    eudora: [
      ["#c995b1", "#f3e7ed", "#79566c", "#9d657f"],
      ["#c5a5a1", "#f1e7e2", "#78584d", "#98756a"],
      ["#aab9cf", "#e7ecf2", "#566a85", "#637c9d"],
      ["#c4ad83", "#efe8d7", "#746247", "#987f56"],
      ["#b6c1a6", "#e8eee4", "#5f6b55", "#76876a"]
    ],
    qdb: [
      ["#d98782", "#f4e3df", "#894f4e", "#b95458"],
      ["#bf8aa0", "#f2e4ea", "#754f60", "#a45b78"],
      ["#d2a35d", "#f5ead5", "#765b3b", "#ba8241"],
      ["#a885a0", "#eee6f0", "#61516c", "#87608a"],
      ["#cfaa8f", "#f2e8de", "#765d4e", "#a87558"]
    ],
    oui: [
      ["#b9bea9", "#e9ebe3", "#596253", "#79826d"],
      ["#bd9b81", "#f0e5d9", "#705542", "#9a775e"],
      ["#9caec0", "#e4eaf0", "#52677b", "#6f879c"],
      ["#c8b87f", "#f0ead4", "#756641", "#a28c52"],
      ["#b1a1ad", "#eee8ec", "#675b64", "#897582"]
    ]
  };

  const bottlePaths = [
    "M55 50 Q55 36 69 36 H131 Q145 36 145 50 V150 Q145 166 130 166 H70 Q55 166 55 150 Z",
    "M48 51 Q48 39 61 39 H139 Q152 39 152 51 V147 Q152 164 136 164 H64 Q48 164 48 147 Z",
    "M65 47 Q65 34 77 34 H123 Q135 34 135 47 V155 Q135 170 120 170 H80 Q65 170 65 155 Z",
    "M53 52 Q53 37 67 37 H133 Q147 37 147 52 V153 Q147 169 131 169 H69 Q53 169 53 153 Z"
  ];

  function bottle(x, y, scale, variant, label, spray) {
    const shape = variant % bottlePaths.length;
    const body = bottlePaths[shape];
    const capRadius = shape % 2 ? 3 : 8;
    const top = spray
      ? '<rect x="83" y="12" width="34" height="13" rx="3" class="art-cap"/><path d="M100 12V6h20v7" class="art-line" fill="none"/>'
      : `<rect x="81" y="15" width="38" height="20" rx="${capRadius}" class="art-cap"/>`;
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      ${top}
      <rect x="86" y="34" width="28" height="15" rx="3" class="art-neck"/>
      <path d="${body}" class="art-glass"/>
      <path d="M64 54v88q0 12 10 16" class="art-highlight"/>
      <path d="M75 100h50v34H75z" class="art-label"/>
      <path d="M83 109h34M88 118h24" class="art-label-line"/>
      <text x="100" y="129" text-anchor="middle" class="art-label-text">${label}</text>
    </g>`;
  }

  function lipstick(x, y, scale, variant) {
    return `<g transform="translate(${x} ${y}) scale(${scale}) rotate(${variant % 2 ? -7 : 6} 100 110)">
      <ellipse cx="100" cy="177" rx="39" ry="8" class="art-shadow"/>
      <path d="M70 95h60v70q0 10-10 10H80q-10 0-10-10z" class="art-cap"/>
      <path d="M76 78h48v24H76z" class="art-label"/>
      <path d="M82 78V60q0-12 18-31 18 19 18 31v18z" class="art-color"/>
      <path d="M85 62q0-12 15-26" class="art-highlight"/>
      <path d="M67 165h66v14H67z" class="art-neck"/>
      <path d="M77 112h46" class="art-label-line"/>
    </g>`;
  }

  function gloss(x, y, scale, variant) {
    return `<g transform="translate(${x} ${y}) scale(${scale}) rotate(${variant % 2 ? 7 : -5} 100 110)">
      <ellipse cx="100" cy="177" rx="32" ry="8" class="art-shadow"/>
      <rect x="78" y="54" width="44" height="112" rx="15" class="art-glass"/>
      <path d="M85 75v62q0 12 8 16" class="art-highlight"/>
      <path d="M84 116h32v39H84z" class="art-label"/>
      <rect x="82" y="30" width="36" height="26" rx="5" class="art-cap"/>
      <path d="M93 25h14l4-21H89z" class="art-color"/>
      <path d="M89 123h22M89 130h22" class="art-label-line"/>
    </g>`;
  }

  function compact(variant) {
    return `<g transform="rotate(${variant % 2 ? 9 : -8} 100 110)">
      <ellipse cx="100" cy="173" rx="57" ry="10" class="art-shadow"/>
      <circle cx="100" cy="102" r="61" class="art-cap"/>
      <circle cx="100" cy="102" r="51" class="art-glass"/>
      <circle cx="100" cy="102" r="39" class="art-color"/>
      <circle cx="100" cy="102" r="31" class="art-highlight"/>
      <path d="M51 100a49 49 0 0 1 98 0" class="art-label-line"/>
      <circle cx="100" cy="102" r="7" class="art-label"/>
    </g>`;
  }

  function lotion(variant) {
    return `<g transform="rotate(${variant % 2 ? 5 : -5} 100 110)">
      <ellipse cx="100" cy="180" rx="39" ry="8" class="art-shadow"/>
      <path d="M79 35h42l4 15 11 17v94q0 12-13 12H77q-13 0-13-12V67l11-17z" class="art-glass"/>
      <path d="M79 35h42v12H79z" class="art-cap"/>
      <path d="M75 87h50v43H75z" class="art-label"/>
      <path d="M83 97h34M88 106h24" class="art-label-line"/>
      <text x="100" y="122" text-anchor="middle" class="art-label-text">CUIDADO</text>
      <path d="M74 71v86q0 8 8 10" class="art-highlight"/>
    </g>`;
  }

  function hairBottle(x, y, scale, variant) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="100" cy="177" rx="35" ry="7" class="art-shadow"/>
      <rect x="66" y="42" width="68" height="127" rx="${variant % 2 ? 18 : 8}" class="art-glass"/>
      <path d="M80 42V25h40v17" class="art-cap"/>
      <path d="M74 93h52v46H74z" class="art-label"/>
      <path d="M83 104h34M85 112h30" class="art-label-line"/>
      <text x="100" y="130" text-anchor="middle" class="art-label-text">CUIDADO</text>
      <path d="M75 56v87q0 14 9 18" class="art-highlight"/>
    </g>`;
  }

  function kit(variant, makeup) {
    const box = `<g>
      <path d="M32 63 100 31l68 32-68 34z" class="art-label"/>
      <path d="M32 63v91l68 32V95z" class="art-cap"/>
      <path d="M168 63v91l-68 32V95z" class="art-glass"/>
      <path d="M100 95v91M88 38l68 32M112 38 44 70" class="art-label-line"/>
      <path d="M93 30h14v69H93z" class="art-color"/>
    </g>`;
    const items = makeup
      ? `${lipstick(4, 50, 0.53, variant)}${gloss(88, 55, 0.50, (variant + 1) % 4)}`
      : `${bottle(3, 43, 0.54, variant, "RITUAL", false)}${bottle(89, 49, 0.48, (variant + 1) % 4, "ESSENCE", false)}`;
    return `<g>${box}${items}</g>`;
  }

  function kindFor(product) {
    const name = String(product.name || "").toLocaleLowerCase("pt-BR");
    if (product.category === "Cabelos") return "hair";
    if (product.category === "Maquiagem") {
      if (/combo|kit/.test(name)) return "makeup-set";
      if (/lip oil|gloss|hidratante labial/.test(name)) return "gloss";
      if (/blush/.test(name) && !/batom/.test(name)) return "compact";
      return "lipstick";
    }
    if (/kit|combo/.test(name)) return "set";
    if (product.category === "Corpo & Banho" || /loção|creme|hidratante|sabonete/.test(name)) return "body";
    if (/splash|spray/.test(name)) return "spray";
    return "perfume";
  }

  function hash(value) {
    let result = 0;
    for (const char of String(value || "")) result = (result * 31 + char.charCodeAt(0)) >>> 0;
    return result;
  }

  function render(product) {
    const kind = kindFor(product);
    const variant = hash(product.id) % 5;
    const palette = (palettes[product.brand] || palettes.boticario)[variant];
    let illustration;

    if (kind === "hair") {
      illustration = `${hairBottle(5, 15, 0.77, variant)}${hairBottle(78, 35, 0.62, (variant + 2) % 5)}`;
    } else if (kind === "set" || kind === "makeup-set") {
      illustration = kit(variant, kind === "makeup-set");
    } else if (kind === "body") {
      illustration = lotion(variant);
    } else if (kind === "gloss") {
      illustration = gloss(0, 20, 1, variant);
    } else if (kind === "compact") {
      illustration = compact(variant);
    } else if (kind === "lipstick") {
      illustration = lipstick(0, 12, 1, variant);
    } else {
      illustration = bottle(0, kind === "spray" ? 9 : 18, kind === "spray" ? 0.94 : 1, variant, kind === "spray" ? "BRUMA" : "ESSENCE", kind === "spray");
    }

    const style = `--art-liquid:${palette[0]};--art-glass:${palette[1]};--art-cap:${palette[2]};--art-color:${palette[3]};--art-label:${palette[1]};--art-ink:${palette[2]}`;
    return `<span class="product-art product-art--${kind}" data-art-variant="${variant}" style="${style}" aria-hidden="true"><svg viewBox="0 0 200 210" focusable="false">${illustration}</svg></span>`;
  }

  window.CASA_FLORA_PRODUCT_ART = { render };
})();
