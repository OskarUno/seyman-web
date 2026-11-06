const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menú');
  mainNav?.classList.remove('open');
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menuButton.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
  mainNav?.classList.toggle('open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => revealObserver.observe(element));

const monitoringCard = document.querySelector('.monitoring-card');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (monitoringCard) {
  if (reducedMotion) {
    monitoringCard.classList.add('is-live');
  } else {
    const monitoringObserver = new IntersectionObserver(([entry]) => {
      monitoringCard.classList.toggle('is-live', entry.isIntersecting);
    }, { threshold: 0.25 });
    monitoringObserver.observe(monitoringCard);
  }
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

const contactForm = document.querySelector('[data-contact-form]');
const formStatus = document.querySelector('[data-form-status]');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const email = contactForm.dataset.email?.trim();
  const whatsapp = contactForm.dataset.whatsapp?.trim();
  const channel = event.submitter?.value || 'whatsapp';
  const subject = `Solicitud web: ${data.get('servicio')}`;
  const body = [
    `Nombre: ${data.get('nombre')}`,
    `Empresa o comunidad: ${data.get('empresa') || 'No indicada'}`,
    `Correo: ${data.get('correo')}`,
    `Servicio: ${data.get('servicio')}`,
    '', String(data.get('mensaje'))
  ].join('\n');

  if (channel === 'whatsapp' && whatsapp) {
    const message = `Hola Seyman, quisiera solicitar información.\n\n${body}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    formStatus.textContent = 'Abriendo WhatsApp con su solicitud…';
    return;
  }

  if (channel === 'email' && email) {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    formStatus.textContent = 'Abriendo su aplicación de correo…';
    return;
  }

  try {
    await navigator.clipboard.writeText(`${subject}\n\n${body}`);
    formStatus.textContent = 'Solicitud copiada. Puede enviarla por WhatsApp o correo.';
  } catch {
    formStatus.textContent = 'No fue posible abrir el canal seleccionado.';
  }
});
