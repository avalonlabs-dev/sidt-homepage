const serviceOptions = {
  titulacion: [
    { value: "titulacion_definicion_tema", label: "Definición del tema" },
    { value: "titulacion_anteproyectos", label: "Anteproyectos" },
    { value: "titulacion_tesis_teoricas", label: "Tesis teóricas" },
    { value: "titulacion_tesis_practicas", label: "Tesis prácticas" },
    { value: "titulacion_capitulos_tesis", label: "Capítulos de las tesis" },
    { value: "titulacion_monografia", label: "Monografía" },
    { value: "titulacion_proyectos", label: "Proyectos" },
    { value: "titulacion_simulaciones_disenos", label: "Simulaciones/Diseños" },
    { value: "titulacion_revisiones", label: "Revisiones" },
  ],
  examen_complexivo: [
    { value: "examen_ensayos", label: "Ensayos" },
    { value: "examen_proyecto_integrador", label: "Proyecto Integrador" },
    { value: "examen_proyecto", label: "Proyecto" },
  ],
  academico: [
    { value: "academico_ensayos", label: "Ensayos" },
    { value: "academico_proyecto_integrador", label: "Proyecto Integrador" },
    { value: "academico_informe", label: "Informes" },
  ],
};

class DependentSelects {
  constructor(categoryId, specificId) {
    this.categorySelect = document.getElementById(categoryId);
    this.specificSelect = document.getElementById(specificId);
    if (this.categorySelect && this.specificSelect) {
      this.init();
    }
  }

  init() {
    this.categorySelect.value = "";
    this.categorySelect.addEventListener("change", () => {
      const selectedCategory = this.categorySelect.value;
      this.updateSpecificServices(selectedCategory);
    });
  }

  updateSpecificServices(category) {
    this.specificSelect.innerHTML =
      '<option value="" selected disabled>Selecciona un servicio específico</option>';
    if (category && serviceOptions[category]) {
      this.specificSelect.disabled = false;
      serviceOptions[category].forEach((service) => {
        const option = document.createElement("option");
        option.value = service.value;
        option.textContent = service.label;
        this.specificSelect.appendChild(option);
      });
    } else {
      this.specificSelect.disabled = true;
    }
  }
}

class PhoneInput {
  constructor(codeId) {
    this.codeSelect = document.getElementById(codeId);
    if (this.codeSelect) {
      this.init();
    }
  }

  init() {
    countryCodes.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = `${country.code} ${country.country}`;
      this.codeSelect.appendChild(option);
    });
  }
}

// Inicializar para ambos formularios

document.addEventListener("DOMContentLoaded", () => {
  new DependentSelects("serviceCategory", "specificService");
  new DependentSelects("serviceCategory-about", "specificService-about");
  new PhoneInput("phoneCode");
  new PhoneInput("phoneCode-about");
});

// Inicializar todos los selects de código de país
const phoneCodeSelects = document.querySelectorAll(".phone-code-select");
const countryCodes = [
  { code: "+593", country: "Ecuador" },
  { code: "+51", country: "Perú" },
  { code: "+54", country: "Argentina" },
  { code: "+57", country: "Colombia" },
  { code: "+591", country: "Bolivia" },
  { code: "+56", country: "Chile" },
  { code: "+52", country: "México" },
  { code: "+58", country: "Venezuela" },
  { code: "+1", country: "EEUU" },
];

phoneCodeSelects.forEach((select) => {
  // Si ya tiene opciones, no las duplica
  if (select.options.length <= 1) {
    countryCodes.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.code;
      opt.textContent = `${option.code} (${option.country})`;
      select.appendChild(opt);
    });
  }
});
