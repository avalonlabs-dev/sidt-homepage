function handleWhatsAppClick(event) {
  event.preventDefault();
  // Redirigir directamente al chat de WhatsApp
  window.open(
    "https://wa.me/593963875608?text=%20%C2%A1Hola!%20Gracias%20por%20contactarnos%20a%20trav%C3%A9s%20de%20Google.%20%F0%9F%98%8A%20%C2%BFQu%C3%A9%20tipo%20de%20trabajo%20deseas%20obtener%20m%C3%A1s%20informaci%C3%B3n%20y%20de%20qu%C3%A9%20carrera%20o%20especialidad%20es%3F",
    "_blank"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const whatsappButton = document.querySelector(".whatsapp-button");
  if (whatsappButton) {
    whatsappButton.addEventListener("click", handleWhatsAppClick);
  }

  // También para los botones de WhatsApp en slogan/about.
  // Se omiten los que ya traen onclick propio (index.html usa gtag_report_conversion,
  // que abre WhatsApp y registra la conversión); si no, se abriría dos veces.
  const sloganWhatsappBtns = document.querySelectorAll(
    ".btn-whatsapp-slogan:not([onclick])"
  );
  sloganWhatsappBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.open(
        "https://wa.me/593963875608?text=%20%C2%A1Hola!%20Gracias%20por%20contactarnos%20a%20trav%C3%A9s%20de%20Google.%20%F0%9F%98%8A%20%C2%BFQu%C3%A9%20tipo%20de%20trabajo%20deseas%20obtener%20m%C3%A1s%20informaci%C3%B3n%20y%20de%20qu%C3%A9%20carrera%20o%20especialidad%20es%3F"

      );
    });
  });
});
