const canvas = document.querySelector("#grid");
const ctx = canvas?.getContext("2d");
const header = document.querySelector(".site-header");
const sections = [...document.querySelectorAll(".section")];
const navLinks = [...document.querySelectorAll("nav a")];
const bgWords = [...document.querySelectorAll(".bg-word")];
const noteBoard = document.querySelector(".note-board");
const noteCards = [...document.querySelectorAll(".note-card")];
const creativeBand = document.querySelector(".creative-band");
const launchSection = document.querySelector(".launch");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
};

/* ============ 加载屏 ============ */

function setupLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;

  if (reduceMotion.matches) {
    loader.remove();
    return;
  }

  document.documentElement.classList.add("is-loading");
  const countEl = loader.querySelector(".loader-count");
  const barEl = loader.querySelector(".loader-bar i");
  const duration = 1300;
  const start = performance.now();

  function tick(now) {
    const raw = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - raw, 3);
    const value = Math.round(eased * 100);

    if (countEl) countEl.textContent = String(value);
    barEl?.style.setProperty("--load", eased.toFixed(3));

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      loader.classList.add("is-done");
      document.documentElement.classList.remove("is-loading");
      setTimeout(() => loader.remove(), 900);
    }
  }

  requestAnimationFrame(tick);
}

/* ============ 自定义光标 ============ */

function setupCursor() {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const label = document.querySelector(".cursor-label");
  if (!dot || !ring || !finePointer.matches || reduceMotion.matches) return;

  document.documentElement.classList.add("custom-cursor");
  const ringPos = { x: pointer.x, y: pointer.y };
  const hoverSelector = "a, button, .flip-card, .note-card, .profile-card";

  window.addEventListener("pointermove", (event) => {
    dot.style.transform = `translate(${event.clientX - 4}px, ${event.clientY - 4}px)`;
  });

  document.addEventListener("mouseover", (event) => {
    const labelled = event.target.closest("[data-cursor]");
    const hoverable = event.target.closest(hoverSelector);

    if (labelled && label) {
      label.textContent = labelled.dataset.cursor;
      ring.classList.add("has-label");
    } else {
      ring.classList.remove("has-label");
    }
    ring.classList.toggle("is-hover", Boolean(hoverable) && !labelled);
  });

  function follow() {
    ringPos.x += (pointer.x - ringPos.x) * 0.16;
    ringPos.y += (pointer.y - ringPos.y) * 0.16;
    const half = ring.offsetWidth / 2;
    ring.style.transform = `translate(${ringPos.x - half}px, ${ringPos.y - half}px)`;
    requestAnimationFrame(follow);
  }

  follow();
}

/* ============ 磁吸元素 ============ */

function setupMagnetic() {
  if (!finePointer.matches || reduceMotion.matches) return;

  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${dx * 0.32}px, ${dy * 0.32}px)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

/* ============ 标题逐字进场 ============ */

function setupSplitText() {
  document.querySelectorAll(".split").forEach((target, lineIndex) => {
    const text = target.textContent;
    target.textContent = "";

    [...text].forEach((char, charIndex) => {
      const piece = document.createElement("i");
      piece.textContent = char === " " ? " " : char;
      piece.style.setProperty("--d", `${lineIndex * 160 + charIndex * 34 + 180}ms`);
      target.appendChild(piece);
    });
  });
}

/* ============ 背景网格线条 ============ */

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
    ctx.strokeStyle = i % 2 === 0 ? `rgba(244, 247, 255, ${alpha})` : `rgba(124, 255, 178, ${alpha * 0.85})`;
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
    ctx.fillStyle = i % 3 === 0 ? `rgba(88, 217, 249, ${0.1 + pulse * 0.12})` : `rgba(244, 247, 255, ${0.1 + pulse * 0.14})`;
    ctx.arc(x, y + pointerShiftY, 1.4 + pulse * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

/* ============ 滚动联动 ============ */

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

  if (!reduceMotion.matches) {
    bgWords.forEach((word) => {
      const parent = word.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const speed = parseFloat(word.dataset.speed || "0.1");
      const offset = (rect.top + rect.height * 0.5 - window.innerHeight * 0.5) * speed;
      word.style.setProperty("--shift", `${offset.toFixed(1)}px`);
    });
  }

  if (noteBoard) {
    const rect = noteBoard.getBoundingClientRect();
    const spread = reduceMotion.matches
      ? 1
      : Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight * 0.72), 0), 1);
    noteCards.forEach((card) => card.style.setProperty("--spread", spread.toFixed(3)));
  }

  if (creativeBand) {
    const rect = creativeBand.getBoundingClientRect();
    const progress = reduceMotion.matches
      ? 1
      : Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1);
    creativeBand.style.setProperty("--p", progress.toFixed(3));
    creativeBand.classList.toggle(
      "is-lit",
      rect.top < window.innerHeight * 0.62 && rect.bottom > window.innerHeight * 0.3
    );
  }

  if (launchSection && !reduceMotion.matches) {
    const away = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.8), 0), 1);
    launchSection.style.setProperty("--away", away.toFixed(3));
  }

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

/* ============ 进场显示 ============ */

function setupReveals() {
  const revealTargets = [
    ...document.querySelectorAll(".section-label, .profile h2, .experience h2, .projects h2, .contact h2, .creative-band h2"),
    ...document.querySelectorAll(".creative-copy > p:last-child, .flip-hint, .ring-hint"),
    ...document.querySelectorAll(".flip-card, .contact-panel a, .orbit-btn, .idea-row span"),
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

/* ============ 卡片 3D 倾斜 + 高光 ============ */

function setupTilt() {
  if (reduceMotion.matches || !finePointer.matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const glare = card.querySelector(".card-glare");

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);

      if (glare) {
        glare.style.setProperty("--glare-x", `${((x + 0.5) * 100).toFixed(1)}%`);
        glare.style.setProperty("--glare-y", `${((y + 0.5) * 100).toFixed(1)}%`);
      }
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

/* ============ 翻转卡片（触屏点按） ============ */

function setupFlipCards() {
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!finePointer.matches) {
        card.classList.toggle("is-flipped");
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });
}

/* ============ 项目 3D 环绕转盘 ============ */

function setupRing() {
  const stage = document.querySelector(".ring-stage");
  const ring = stage?.querySelector(".ring");
  if (!stage || !ring) return;

  const cards = [...ring.children];
  const step = 360 / cards.length;
  const section = stage.closest(".projects") || stage;
  const spinDistance = (360 + step * 1.5) * 0.7;
  const autoSpeed = reduceMotion.matches ? 0 : 0.035;
  let rotation = 0;
  let scrollRotation = 0;
  let interactionRotation = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;

  cards.forEach((card, index) => {
    card.style.setProperty("--angle", `${index * step}deg`);
  });

  stage.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    velocity = 0;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    velocity = Math.max(Math.min(dx * 0.11, 18), -18);
    interactionRotation += dx * 0.22;
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => {
    stage.addEventListener(type, () => {
      dragging = false;
    });
  });

  function updateTargetRotation() {
    const rect = section.getBoundingClientRect();
    const travel = window.innerHeight + rect.height;
    const progress = travel > 0 ? Math.min(Math.max((window.innerHeight - rect.top) / travel, 0), 1) : 0;
    scrollRotation = -progress * spinDistance;
  }

  function frame() {
    updateTargetRotation();

    if (!dragging) {
      velocity *= 0.86;
      interactionRotation += velocity + autoSpeed;
    }

    const targetRotation = scrollRotation + interactionRotation;
    rotation = reduceMotion.matches ? targetRotation : rotation + (targetRotation - rotation) * 0.14;

    ring.style.setProperty("--ring-rot", `${rotation.toFixed(2)}deg`);

    cards.forEach((card, index) => {
      const angle = (((index * step + rotation) % 360) + 360) % 360;
      const depth = (Math.cos((angle * Math.PI) / 180) + 1) / 2;
      card.style.setProperty("--depth", depth.toFixed(3));
    });

    requestAnimationFrame(frame);
  }

  updateTargetRotation();
  frame();
}

/* ============ 全局监听与启动 ============ */

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
});

window.addEventListener("resize", () => {
  resize();
  updateScrollEffects();
});

window.addEventListener("scroll", updateScrollEffects, { passive: true });

setupLoader();
setupCursor();
setupMagnetic();
setupSplitText();
resize();
setupReveals();
setupTilt();
setupFlipCards();
setupRing();
updateScrollEffects();
draw();
