const slidesData = [
  {
    title: [
      "Asesoría,",
      "Elaboración y",
      "Desarrollo <span class='slogan-extra'>de tesis</span>",
    ],
    description:
      "Somos una empresa dedicada a la asesoría, elaboración y desarrollo de tesis de grado. Nos enfocamos en brindar soluciones personalizadas y de alta calidad para cada cliente, garantizando resultados exitosos y satisfacción total.",
    image: "./src/images/student01.png",
  },
  {
    title: [
      "Logra obtener",
      "tu <span class='slogan-extra'>Título</span>",
    ],
    description:
      "Logra obtener tu título con la mejor asesoría y desarrollo de tesis. Nuestro equipo de expertos te guiará en cada paso del proceso, asegurando un trabajo de calidad que cumpla con todos los estándares académicos.",
    image: "./src/images/student02.png",
  },
  {
    title: [
      "Tesis + Asesoría en SIDT",
      "= Graduación Exitosa",
      "Gradúate <span class='slogan-extra'>¡YA!</span>",
    ],
    description:
      "Tu éxito es nuestra prioridad, y trabajamos arduamente para asegurar que cada tesis sea una obra maestra que refleje tu esfuerzo y dedicación.",
    image: "./src/images/student03.png",
  },
];

const testimonialsData = [
  // Primer slide
  {
    testimonials: [
      {
        image: "./src/images/testimonial01.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Cristian",
        university: "UPS",
      },
      {
        image: "./src/images/testimonial02.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Adriana",
        university: "UDA",
      },
      {
        image: "./src/images/testimonial03.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Marlon",
        university: "UPS",
      },
    ],
  },
  // Segundo slide
  {
    testimonials: [
      {
        image: "./src/images/testimonial04.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Madelin",
        university: "UDA",
      },
      {
        image: "./src/images/testimonial05.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Nohelia",
        university: "UPS",
      },
      {
        image: "./src/images/testimonial06.webp",
        studentImage: "./src/images/profile01.webp",
        studentName: "Pamela",
        university: "UPS",
      },
    ],
  },
];

class SliderContent {
  constructor(selector, data, interval = 5000) {
    this.container = document.querySelector(selector);
    this.data = data;
    this.currentSlide = 0;
    this.interval = interval;

    this.container.style.transition = "opacity 0.8s ease-in-out";

    this.init();
  }

  init() {
    this.updateSlide();
    setInterval(() => this.nextSlide(), this.interval);
  }

  updateSlide() {
    const slide = this.data[this.currentSlide];
    const titleHTML = slide.title
      .map((text) => `<span class="slogan-bold">${text}</span>`)
      .join("");

    const newContent = `
        <div class="row">
            <div class="col-lg-7 col-12">
                <div>
                    <h1>${titleHTML}</h1>
                    <p>${slide.description}</p>
                </div>
            </div>
            <div class="col-lg-5 col-12">
                <img class="slogan-img" src="${slide.image}" alt="">
            </div>
        </div>
    `;

    this.container.style.opacity = "0";

    setTimeout(() => {
      this.container.innerHTML = newContent;
      // Pequeño delay antes del fade in para asegurar que el contenido esté listo
      requestAnimationFrame(() => {
        this.container.style.opacity = "1";
        this.container.style.zIndex = "2";
      });
    }, 800);
  }

  nextSlide() {
    this.container.style.opacity = "0";

    setTimeout(() => {
      this.currentSlide = (this.currentSlide + 1) % this.data.length;
      this.updateSlide();
    }, 800);
  }
}

class TestimonialsSlider {
  constructor(selector, data) {
    this.container = document.querySelector(selector);
    if (!this.container) return; // Si no existe el contenedor, no hacer nada

    this.data = data;
    this.currentSlide = 0;
    this.createSlides();
    this.setupNavigation();

    // Mostrar el primer slide
    if (this.slides && this.slides.length > 0) {
      this.slides[0].style.display = "flex";
      this.slides[0].style.opacity = "1";
    }
  }

  reorganizeDataForBreakpoints(data) {
    if (window.innerWidth <= 767.98) {
      // Para móviles: un testimonio por slide
      const newData = [];
      const allTestimonials = data.reduce((acc, slide) => {
        return acc.concat(slide.testimonials);
      }, []);

      allTestimonials.forEach((testimonial) => {
        newData.push({
          testimonials: [testimonial],
        });
      });
      return newData;
    } else if (window.innerWidth <= 991.98) {
      // Para tablets: mantener la lógica existente de dos por slide
      const newData = [];
      const allTestimonials = data.reduce((acc, slide) => {
        return acc.concat(slide.testimonials);
      }, []);

      for (let i = 0; i < allTestimonials.length; i += 2) {
        newData.push({
          testimonials: allTestimonials.slice(i, i + 2),
        });
      }
      return newData;
    }
    // Para desktop: mantener la estructura original
    return data;
  }

  init() {
    this.createSlides();
    this.setupNavigation();
  }

  createSlides() {
    const slidesContainer = document.createElement("div");
    slidesContainer.className = "testimonials-slides-container";

    slidesContainer.innerHTML = this.data
      .map(
        (slide, index) => `
        <div class="testimonials-slide" style="opacity: ${
          index === 0 ? 1 : 0
        }; display: ${index === 0 ? "flex" : "none"}">
            <div class="row justify-content-center">
                ${slide.testimonials
                  .map(
                    (testimonial) => `
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="panel-testimonials">
                            <div class="testimonials-vector">
                                <svg xmlns="http://www.w3.org/2000/svg" width="65" height="54" viewBox="0 0 65 54" fill="none">
                                    <path d="M19.8 0H27V13.2H20.2C16.8 13.2 15.2 14 15.2 18.2V22.4H27.2V53.4H0V18.4C0 6.00001 7.4 0 19.8 0ZM57 0H64.2V13.2H57.6C54.2 13.2 52.6 14 52.6 18.2V22.4H64.6V53.4H37.2V18.4C37.2 6.00001 44.6 0 57 0Z" fill="#1E1E1E"/>
                                </svg>
                            </div>
                            <div class="panel-testimonials-bg">
                                <div class="panel-testimonials-img">
                                    <img src="${testimonial.image}" alt="Testimonio">
                                </div>
                                <div class="panel-testimonials-footer">
                                    <div class="panel-testimonials-footer-img">
                                        <img src="${testimonial.studentImage}" alt="Estudiante">
                                        <h6>${testimonial.studentName}</h6>
                                        <p>${testimonial.university}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `
      )
      .join("");

    this.container.appendChild(slidesContainer);
    this.slides = this.container.querySelectorAll(".testimonials-slide");
  }

  setupNavigation() {
    const prevBtn = this.container.querySelector(".prev");
    const nextBtn = this.container.querySelector(".next");

    prevBtn.addEventListener("click", () =>
      this.showSlide(this.currentSlide - 1)
    );
    nextBtn.addEventListener("click", () =>
      this.showSlide(this.currentSlide + 1)
    );
  }

  showSlide(index) {
    // Ocultar slide actual
    this.slides[this.currentSlide].style.opacity = "0";
    setTimeout(() => {
      this.slides[this.currentSlide].style.display = "none";

      // Actualizar índice
      this.currentSlide = index;
      if (this.currentSlide >= this.slides.length) this.currentSlide = 0;
      if (this.currentSlide < 0) this.currentSlide = this.slides.length - 1;

      // Mostrar nuevo slide
      const newSlide = this.slides[this.currentSlide];
      newSlide.style.display = "flex";
      setTimeout(() => {
        newSlide.style.opacity = "1";
      }, 50);
    }, 500);
  }
}

// Mejorar el manejo del resize
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const testimonialSliderElement = document.querySelector(
      ".testimonials-slider"
    );
    if (testimonialSliderElement && testimonialsSlider) {
      testimonialSliderElement.innerHTML = "";
      testimonialsSlider = new TestimonialsSlider(
        ".testimonials-slider",
        testimonialsData
      );
    }
  }, 250);
});

// Inicializar los sliders cuando el documento esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el slider de contenido solo si existe el elemento
  const sloganSlider = document.querySelector(".slogan-content-slider");
  if (sloganSlider) {
    const slider = new SliderContent(
      ".slogan-content-slider",
      slidesData,
      5000
    );
  }

  // Inicializar el slider de testimonios si existe el elemento
  const testimonialSliderElement = document.querySelector(
    ".testimonials-slider"
  );
  if (testimonialSliderElement) {
    testimonialsSlider = new TestimonialsSlider(
      ".testimonials-slider",
      testimonialsData
    );
  }
});
