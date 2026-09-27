import { technologies, projects, education } from './content.js';

const create = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

function renderTechnologies() {
  const grid = document.querySelector('#tech-grid');
  technologies.forEach(({ name, symbol, group }, index) => {
    const card = create('article', 'tech-card');
    card.dataset.reveal = '';
    card.style.setProperty('--reveal-delay', `${index * 45}ms`);
    card.append(create('span', 'tech-index', `0${index + 1} · ${group.toUpperCase()}`));
    card.append(create('span', 'tech-symbol', symbol));
    card.append(create('span', 'tech-name', name));
    grid.append(card);
  });
}

function renderProjects() {
  const grid = document.querySelector('#projects-grid');
  projects.forEach((project, index) => {
    const card = create('article', `project-card${project.featured ? ' project-featured' : ''}`);
    card.dataset.reveal = '';
    card.style.setProperty('--reveal-delay', `${index * 100}ms`);
    const media = create('div', 'project-media');
    const image = document.createElement('img');
    image.src = project.image;
    image.alt = project.imageAlt;
    image.loading = 'lazy';
    image.decoding = 'async';
    media.append(image);
    const shade = create('div', 'project-shade');
    const content = create('div', 'project-content');
    const copy = create('div');
    copy.append(create('span', 'project-type', project.type));
    copy.append(create('h3', '', project.title));
    copy.append(create('p', '', project.description));
    const link = create('a', 'project-link', '↗');
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Visitar el proyecto ${project.title}`);
    content.append(copy, link);
    card.append(media, shade, content);
    grid.append(card);
  });
}

function renderEducation() {
  const timeline = document.querySelector('#timeline');
  education.forEach((item, index) => {
    const entry = create('article', 'timeline-item');
    entry.dataset.reveal = '';
    entry.style.setProperty('--reveal-delay', `${index * 120}ms`);
    entry.append(create('span', 'timeline-date', item.date));
    entry.append(create('h3', '', item.title));
    entry.append(create('p', '', item.detail));
    timeline.append(entry);
  });
}

function setupNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-links');
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  });
  links.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const updateNav = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }
}

function setupReveal() {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(target => target.classList.add('is-visible'));
    return;
  }
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  targets.forEach(target => observer.observe(target));
}

function setupProjectGlow() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.project-card').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--spot-x', `${x * 100}%`);
        card.style.setProperty('--spot-y', `${y * 100}%`);
        card.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * 2.2}deg) rotateY(${(x - 0.5) * 2.2}deg) translateY(-3px)`;
      });
    });
    card.addEventListener('pointerleave', () => { if (frame) cancelAnimationFrame(frame); card.style.transform = ''; });
  });
}

function setupHeroCanvas() {
  const canvas = document.querySelector('.hero-canvas');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = matchMedia('(max-width: 760px)').matches;
  const pointerFine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hero = canvas.parentElement;
  let width = 0, height = 0, points = [], frame = 0, lastDraw = 0;
  const pointer = { x: -1000, y: -1000 };
  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = smallScreen ? 24 : 62;
    points = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12, radius: Math.random() * 1.3 + .5 }));
  };
  const draw = timestamp => {
    frame = 0;
    if (document.hidden) return;
    if (timestamp - lastDraw < (smallScreen ? 48 : 30)) { frame = requestAnimationFrame(draw); return; }
    lastDraw = timestamp;
    context.clearRect(0, 0, width, height);
    points.forEach((point, index) => {
      if (!reducedMotion) {
        point.x += point.vx; point.y += point.vy;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        if (pointerFine) {
          const dx = point.x - pointer.x, dy = point.y - pointer.y, distance = Math.hypot(dx, dy);
          if (distance < 115 && distance > 0) { point.x += dx / distance * .28; point.y += dy / distance * .28; }
        }
      }
      context.beginPath(); context.fillStyle = 'rgba(126, 203, 226, .52)'; context.arc(point.x, point.y, point.radius, 0, Math.PI * 2); context.fill();
      for (let otherIndex = index + 1; otherIndex < points.length; otherIndex++) {
        const other = points[otherIndex], distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 92) { context.beginPath(); context.strokeStyle = `rgba(93, 173, 205, ${.12 * (1 - distance / 92)})`; context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke(); }
      }
    });
    if (!reducedMotion) frame = requestAnimationFrame(draw);
  };
  resize(); draw(0);
  if (!reducedMotion) {
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { resize(); if (!frame) frame = requestAnimationFrame(draw); }, 120); }, { passive: true });
    if (pointerFine) hero.addEventListener('pointermove', event => { const rect = hero.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw); });
  }
}

function setupContactForm() {
  const form = document.querySelector('#contact-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const subject = encodeURIComponent(`Contacto desde el portafolio — ${values.get('name')}`);
    const body = encodeURIComponent(`${values.get('message')}\n\nNombre: ${values.get('name')}\nCorreo: ${values.get('email')}`);
    document.querySelector('#form-note').textContent = 'Abriendo tu aplicación de correo para preparar el mensaje.';
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });
}

renderTechnologies();
renderProjects();
renderEducation();
setupNavigation();
setupReveal();
setupProjectGlow();
setupHeroCanvas();
setupContactForm();
