document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".needs-validation");
  const whatsappInput = document.getElementById("whatsapp");
  const phoneCodeSelect = document.getElementById("phoneCode");

  // Función para validar número de WhatsApp
  function validateWhatsApp(number, countryCode) {
    // Eliminar espacios y caracteres especiales
    number = number.replace(/\s+/g, "").replace(/-/g, "");

    // Validar según el código de país
    switch (countryCode) {
      case "+593": // Ecuador
        return /^[9][0-9]{8}$/.test(number); // 9 dígitos comenzando con 9
      case "+51": // Perú
        return /^[9][0-9]{8}$/.test(number); // 9 dígitos comenzando con 9
      case "+57": // Colombia
        return /^[3][0-9]{9}$/.test(number); // 10 dígitos comenzando con 3
      default:
        return /^[0-9]{8,12}$/.test(number); // Entre 8 y 12 dígitos para otros países
    }
  }

  // Agregar códigos de país al select
  const countryCodes = [
    { code: "+54", country: "Argentina 🇦🇷" },
    { code: "+591", country: "Bolivia 🇧🇴" },
    { code: "+55", country: "Brasil 🇧🇷" },
    { code: "+56", country: "Chile 🇨🇱" },
    { code: "+57", country: "Colombia 🇨🇴" },
    { code: "+506", country: "Costa Rica 🇨🇷" },
    { code: "+593", country: "Ecuador 🇪🇨" },
    { code: "+503", country: "El Salvador 🇸🇻" },
    { code: "+502", country: "Guatemala 🇬🇹" },
    { code: "+504", country: "Honduras 🇭🇳" },
    { code: "+52", country: "México 🇲🇽" },
    { code: "+505", country: "Nicaragua 🇳🇮" },
    { code: "+507", country: "Panamá 🇵🇦" },
    { code: "+595", country: "Paraguay 🇵🇾" },
    { code: "+51", country: "Perú 🇵🇪" },
    { code: "+598", country: "Uruguay 🇺🇾" },
    { code: "+58", country: "Venezuela 🇻🇪" },
  ];

  countryCodes.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.code} ${country.country}`;
    phoneCodeSelect.appendChild(option);
  });

  // Validar mientras el usuario escribe
  whatsappInput.addEventListener("input", function (e) {
    let value = e.target.value;

    // Permitir solo números
    value = value.replace(/[^\d]/g, "");

    // Formatear el número con espacios cada 3 dígitos
    value = value.replace(/(\d{3})(?=\d)/g, "$1 ");

    e.target.value = value;

    // Validar el número
    const countryCode = phoneCodeSelect.value;
    const isValid = validateWhatsApp(value, countryCode);

    if (isValid) {
      whatsappInput.classList.remove("is-invalid");
      whatsappInput.classList.add("is-valid");
    } else {
      whatsappInput.classList.remove("is-valid");
      whatsappInput.classList.add("is-invalid");
    }
  });

  // Validar al enviar el formulario
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;
    const requiredFields = form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("is-invalid");
        isValid = false;
      } else {
        field.classList.remove("is-invalid");
        field.classList.add("is-valid");
      }
    });

    // Validar WhatsApp específicamente
    const whatsappNumber = whatsappInput.value;
    const countryCode = phoneCodeSelect.value;
    if (!validateWhatsApp(whatsappNumber, countryCode)) {
      whatsappInput.classList.add("is-invalid");
      isValid = false;
    }

    if (isValid) {
      // Aquí puedes enviar el formulario
      console.log("Formulario válido, enviando...");
      form.submit();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Selecciona todos los formularios que requieren validación
  const forms = document.querySelectorAll("form.needs-validation");
  forms.forEach((form) => {
    // Para cada input, select y textarea requerido
    const fields = form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    fields.forEach((field) => {
      // Validación al salir del campo
      field.addEventListener("blur", function () {
        if (!field.checkValidity()) {
          field.classList.add("is-invalid");
          field.classList.remove("is-valid");
        } else {
          field.classList.remove("is-invalid");
          field.classList.add("is-valid");
        }
      });
      // Validación en tiempo real al escribir o cambiar
      field.addEventListener("input", function () {
        if (!field.checkValidity()) {
          field.classList.add("is-invalid");
          field.classList.remove("is-valid");
        } else {
          field.classList.remove("is-invalid");
          field.classList.add("is-valid");
        }
      });
    });
  });
});

// Validación personalizada para el campo de presupuesto
document.addEventListener("DOMContentLoaded", function () {
  const budgetFields = document.querySelectorAll('input[name="budget"]');
  budgetFields.forEach((field) => {
    field.addEventListener("input", function () {
      // Solo permite números enteros positivos
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });
  const budgetAboutFields = document.querySelectorAll(
    'input[name="budget-about"]'
  );
  budgetAboutFields.forEach((field) => {
    field.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });
});

// Validación personalizada para el campo de WhatsApp (solo números)
document.addEventListener("DOMContentLoaded", function () {
  // Primer formulario
  const whatsappFields = document.querySelectorAll('input[name="whatsapp"]');
  whatsappFields.forEach((field) => {
    field.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });
  // Segundo formulario
  const whatsappAboutFields = document.querySelectorAll(
    'input[name="whatsapp-about"]'
  );
  whatsappAboutFields.forEach((field) => {
    field.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });
});
