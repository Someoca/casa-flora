(function () {
  "use strict";

  const phone = "5519993787673";
  const message = [
    "Olá, Casa Flora! 🌸 Vim pelo site e quero descobrir meu próximo favorito.",
    "Pode me ajudar com o catálogo e confirmar preços e disponibilidade?"
  ];

  const hostname = window.location.hostname.toLowerCase();
  const localHost = hostname === "localhost" || hostname === "127.0.0.1" ||
    hostname === "::1" || hostname.endsWith(".localhost");
  if ((window.location.protocol === "http:" || window.location.protocol === "https:") && !localHost) {
    message.push(`Estou vendo o catálogo: ${new URL("catalogo.html", window.location.href).href}`);
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message.join("\n\n"))}`;
  document.querySelectorAll("[data-vip-support]").forEach(link => {
    link.href = url;
  });
})();
