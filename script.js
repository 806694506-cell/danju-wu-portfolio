const canvas = document.querySelector("#grid");
const ctx = canvas?.getContext("2d");
const header = document.querySelector(".site-header");
const sections = [...document.querySelectorAll(".section")];
const navLinks = [...document.querySelectorAll("nav a")];
const cursorOrb = document.querySelector(".cursor-orb");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
};

function resize() {
  if (!canvas || !ctx) return;

  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function draw() {
  if (!ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const time = performance.now() * 0.001;
  const scroll = window.scrollY * 0.045;
  const pointerShiftX = (pointer.x / Math.max(width, 1) - 0.5) * 38;
  const pointerShiftY = (pointer.y / Math.max(height, 1) - 0.5) * 28;

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";

  for (let i = -5; i < 12; i += 1) {
    const phase = time * 0.7 + i * 0.82;
    const alpha = 0.12 + (i % 3) * 0.035;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(57, 255, 20, ${alpha})`;
    ctx.lineWidth = i % 4 === 0 ? 2.2 : 1.15;
    ctx.moveTo(
      -180 + Math.sin(phase) * 42 + pointerShiftX,
      height * 0.78 + i * 92 - scroll + Math.cos(phase) * 24
    );
    ctx.bezierCurveTo(
      width * 0.28,
      height * 0.62 + i * 54 + Math.sin(phase * 1.7) * 56,
      width * 0.72,
      height * 0.22 + i * 46 + Math.cos(phase * 1.3) * 48,
      width + 190 + pointerShiftX,
      height * 0.05 + i * 78 + scroll * 0.55 + pointerShiftY
    );
    ctx.stroke();
  }

  for (let i = 0; i < 34; i += 1) {
    const x = (i * 137 + time * 46 + pointerShiftX * 2) % (width + 160) - 80;
    const y = (Math.sin(i * 1.77 + time) * 0.5 + 0.5) * height;
    const pulse = 0.45 + Math.sin(time * 2 + i) * 0.35;

    ctx.beginPath();
    ctx.fillStyle = `rgba(180, 255, 0, ${0.12 + pulse * 0.16})`;
    ctx.arc(x, y + pointerShiftY, 1.4 + pulse * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

function updateScrollEffects() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  document.body.style.setProperty("--scroll-progress", progress.toFixed(4));
  header?.classList.toggle("is-scrolled", window.scrollY > 18);

  sections.forEach((section, index) => {
    if (reduceMotion.matches) {
      section.style.setProperty("--parallax", "0");
      return;
    }

    const rect = section.getBoundingClientRect();
    const centerOffset = rect.top + rect.height * 0.5 - window.innerHeight * 0.5;
    const strength = index === 0 ? 0.012 : 0.022;
    section.style.setProperty("--parallax", (centerOffset * strength).toFixed(2));
  });

  let activeSection = null;
  sections.forEach((section) => {
    if (section.id && section.getBoundingClientRect().top <= window.innerHeight * 0.38) {
      activeSection = section;
    }
  });

  if (activeSection) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection.id}`);
    });
  }
}

function setupReveals() {
  const revealTargets = [
    ...document.querySelectorAll(".profile .section-label, .experience .section-label, .projects .section-label, .contact .section-label"),
    ...document.querySelectorAll(".profile h2, .experience h2, .projects h2, .contact h2"),
    ...document.querySelectorAll(".profile-grid article, .timeline article, .project-grid article, .contact-panel a"),
  ];

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

function setupTilt() {
  if (reduceMotion.matches) return;

  const tiltTargets = document.querySelectorAll(".profile-card, .profile-grid article, .project-grid article");

  tiltTargets.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
  cursorOrb?.classList.add("is-active");
});

window.addEventListener("resize", () => {
  resize();
  updateScrollEffects();
});

window.addEventListener("scroll", updateScrollEffects, { passive: true });

resize();
setupReveals();
setupTilt();
updateScrollEffects();
requestAnimationFrame(() => {
  const overflowing = [...document.querySelectorAll("h1, h2, h3, .pill, .contact-panel a, .profile-card dd, small")]
    .filter((element) => element.scrollWidth > element.clientWidth + 1)
    .map((element) => element.textContent.trim().slice(0, 80));

  if (overflowing.length > 0) {
    console.warn("Text overflow candidates:", overflowing);
  }
});
draw();
