const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// El menú (catálogo de tortas y tartas) vive directo en el HTML, no se genera por JS:
// así carga rápido y funciona igual aunque el JS falle. Para agregar/quitar un
// producto, editar las tarjetas <article class="product-card"> en index.html.

// Galería de tortas personalizadas: alimenta el carrusel de 3 filas.
// Cada fila del carrusel tiene sus propias fotos (ningún producto se repite entre filas).
const galeriaRows = [
  [
    { src: 'assets/images/galeria_vintage.jpg', alt: 'Torta personalizada con flores y mariposas' },
    { src: 'assets/images/galeria_luna_y_sol.jpg', alt: 'Torta personalizada sol y luna' },
    { src: 'assets/images/galeria_dia_de_la_madre.jpg', alt: 'Torta personalizada Día de la Madre' },
    { src: 'assets/images/galeria_cumpleanos.jpg', alt: 'Torta personalizada de cumpleaños' },
    { src: 'assets/images/galeria_hombre_arana.jpg', alt: 'Torta personalizada temática' },
    { src: 'assets/images/galeria_caja.jpg', alt: 'Torta personalizada sol y luna, presentación en caja' },
    { src: 'assets/images/galeria_dos_pisos.jpg', alt: 'Torta personalizada de dos pisos para quince años' },
  ],
  [
    { src: 'assets/images/galeria_dulces.jpg', alt: 'Torta personalizada con caramelos y golosinas' },
    { src: 'assets/images/galeria_bandera.jpg', alt: 'Torta personalizada bandera argentina' },
    { src: 'assets/images/galeria_lila_cumple.jpg', alt: 'Torta personalizada de cumpleaños en lila' },
    { src: 'assets/images/galeria_flores_blancas.jpg', alt: 'Torta personalizada con flores blancas y rosadas' },
    { src: 'assets/images/galeria_corazon.jpg', alt: 'Torta personalizada en forma de corazón' },
    { src: 'assets/images/galeria_muneca.jpg', alt: 'Torta personalizada de muñeca' },
  ],
  [
    { src: 'assets/images/galeria_rosas.jpg', alt: 'Torta personalizada con rosas rosadas' },
    { src: 'assets/images/galeria_choco_corazon.jpg', alt: 'Torta personalizada de chocolate en forma de corazón' },
    { src: 'assets/images/galeria_telarana.jpg', alt: 'Torta personalizada de chocolate con telaraña' },
    { src: 'assets/images/galeria_trufas.jpg', alt: 'Torta personalizada de trufas de chocolate' },
    { src: 'assets/images/galeria_conejito.jpg', alt: 'Torta personalizada de conejito' },
    { src: 'assets/images/galeria_vintage_violeta.jpg', alt: 'Torta personalizada vintage en violeta' },
    { src: 'assets/images/galeria_messi.jpg', alt: 'Torta personalizada temática fútbol' },
  ],
];

let revealObserver;

// La píldora que marca la pestaña activa es un elemento aparte que se desliza
// (transform + width) hasta la posición del botón activo, en vez de que cada
// botón haga fade de su propio fondo. Acá se mide dónde está ese botón.
function updateTabIndicator() {
  const tabsContainer = document.querySelector('.menu-tabs');
  const indicator = document.querySelector('.menu-tab-indicator');
  const active = document.querySelector('.menu-tab.is-active');
  if (!tabsContainer || !indicator || !active) return;

  const containerRect = tabsContainer.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  tabsContainer.style.setProperty('--indicator-x', `${activeRect.left - containerRect.left}px`);
  tabsContainer.style.setProperty('--indicator-width', `${activeRect.width}px`);
}

// Las tarjetas ya están todas en el HTML; acá solo se alterna qué categoría se ve.
function selectTab(filtro) {
  document.querySelectorAll('.menu-tab').forEach((tab) => {
    const active = tab.dataset.filter === filtro;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelector('.menu-section').classList.toggle('filter-tartas', filtro === 'tartas');
  updateTabIndicator();
}

function initMenuTabs() {
  document.querySelectorAll('.menu-tab').forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.filter));
  });
  updateTabIndicator();
  window.addEventListener('resize', updateTabIndicator);
}

function initGotoTabLinks() {
  document.querySelectorAll('[data-goto-tab]').forEach((link) => {
    link.addEventListener('click', () => selectTab(link.dataset.gotoTab));
  });
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// La barra se esconde al bajar y reaparece al subir, en cualquier tamaño de pantalla.
// Con el scroll con inercia (Lenis) el scroll avanza en muchos pasos chiquitos por
// frame, y algunos de esos pasos pueden tener signo contrario por un instante; si
// reaccionábamos a cada paso individual, la barra "titubeaba" (parecían dos
// animaciones peleando). Para evitarlo, sólo reacciona a un movimiento sostenido
// en una misma dirección, así queda una sola animación limpia.
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  const nav = document.getElementById('mainNav');
  const TOGGLE_THRESHOLD = 60;
  let lastScrollY = window.scrollY;
  let direction = 0;
  let accumulated = 0;

  function onScroll() {
    const currentY = window.scrollY;

    const navOpen = nav.classList.contains('is-open');
    const delta = currentY - lastScrollY;
    lastScrollY = currentY;

    if (navOpen || currentY <= 80) {
      header.classList.remove('is-hidden');
      direction = 0;
      accumulated = 0;
      return;
    }

    const currentDirection = delta > 0 ? 1 : delta < 0 ? -1 : direction;
    if (currentDirection !== direction) {
      direction = currentDirection;
      accumulated = 0;
    }
    accumulated += Math.abs(delta);

    if (accumulated > TOGGLE_THRESHOLD) {
      header.classList.toggle('is-hidden', direction > 0);
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');

  // Red de seguridad: si nada se reveló solo en los primeros segundos (lo esperable
  // es que al menos el contenido de arriba de la pantalla ya se haya mostrado), algo
  // falló en el IntersectionObserver, y se muestra todo el contenido igual en vez de
  // dejarlo invisible para siempre. Si el sistema normal ya reveló algo, no interviene,
  // para no arruinar el efecto de aparición al hacer scroll en el resto de la página.
  const fallback = setTimeout(() => {
    if (document.querySelectorAll('.reveal.is-visible').length === 0) {
      items.forEach((item) => item.classList.add('is-visible'));
    }
  }, 3000);

  if (typeof IntersectionObserver === 'undefined') {
    clearTimeout(fallback);
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  items.forEach((item) => revealObserver.observe(item));
}

// Parallax: un único loop de scroll (rAF) mueve la foto del hero y las imágenes
// marcadas con .parallax-img según su posición en la pantalla. Se desactiva
// por completo si el usuario prefiere menos movimiento.
function initParallax() {
  if (prefersReducedMotion) return;

  const heroPhoto = document.getElementById('heroPhoto');
  const layers = Array.from(document.querySelectorAll('.parallax-img')).map((img) => ({
    el: img,
    speed: parseFloat(img.dataset.speed) || 0.1,
  }));

  let ticking = false;

  function update() {
    ticking = false;
    const viewportH = window.innerHeight;
    const viewportCenter = viewportH / 2;

    if (heroPhoto) {
      const py = Math.min(window.scrollY * 0.06, 24);
      heroPhoto.style.setProperty('--hero-py', `${py}px`);
    }

    layers.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const offset = (viewportCenter - elCenter) * speed;
      const clamped = Math.max(-40, Math.min(40, offset));
      el.style.setProperty('--py', `${clamped}px`);
    });
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
}

// Carrusel de la galería: 3 filas infinitas, cada una con sus propias fotos
// (ninguna se repite entre filas) duplicadas una vez para el loop sin cortes.
function buildCarousel() {
  const rows = document.querySelectorAll('#galleryCarousel .carousel-row');
  if (!rows.length) return;

  rows.forEach((row, rowIndex) => {
    const track = row.querySelector('.carousel-track');
    const orderedOnce = galeriaRows[rowIndex] || [];
    const sequence = [...orderedOnce, ...orderedOnce]; // duplicado para el loop -50%

    track.innerHTML = sequence
      .map((item, i) => {
        const isDuplicate = i >= orderedOnce.length;
        const alt = isDuplicate ? '' : `${item.alt} - Dulce Armonía, pastelería artesanal en General Galarza`;
        return `
        <figure class="carousel-card" data-lightbox-trigger data-caption="${item.alt}" ${isDuplicate ? 'aria-hidden="true"' : ''}>
          <img src="${item.src}" alt="${alt}">
        </figure>
      `;
      })
      .join('');

    track.style.setProperty('--duration', `${row.dataset.duration || 45}s`);
    track.style.setProperty('--anim-dir', row.dataset.direction === 'right' ? 'reverse' : 'normal');
  });
}

// Lightbox: click en cualquier foto marcada con data-lightbox-trigger la abre en grande.
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxDescription = document.getElementById('lightboxDescription');
  const closeBtn = document.getElementById('lightboxClose');

  function open(src, caption, description) {
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    lightboxCaption.textContent = caption || '';
    // innerHTML a propósito: la descripción es contenido nuestro (escrito en el HTML
    // del catálogo, no algo que tipee un visitante), y algunas fichas necesitan una
    // listita de rellenos, no solo texto corrido.
    lightboxDescription.innerHTML = description || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox-trigger]');
    if (!trigger) return;
    const img = trigger.querySelector('img');
    if (!img) return;
    open(img.src, trigger.dataset.caption, trigger.dataset.description);
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}

// Botones "magnéticos": un resplandor sigue al cursor dentro del botón.
function initMagneticButtons() {
  if (prefersReducedMotion) return;

  document.querySelectorAll('.btn-magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  });
}

// Scroll con inercia (Lenis): el scroll de toda la página se siente más fluido,
// con un poco de peso, en vez del salto seco del scroll nativo. Se apaga solo si
// el usuario prefiere menos movimiento, o si la librería no llegó a cargar (CDN caído).
function initSmoothScroll() {
  if (prefersReducedMotion || typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Los links con # (nav, "Ver Tortas/Tartas", flecha del hero) usan el scroll
  // suave de Lenis en vez del salto instantáneo del navegador.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20, duration: 1.2 });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollReveal();
  buildCarousel();
  initLightbox();
  initMenuTabs();
  initGotoTabLinks();
  initMobileNav();
  initHeaderScroll();
  initParallax();
  initMagneticButtons();
  document.getElementById('year').textContent = new Date().getFullYear();
});
