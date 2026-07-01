const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Custom cursor
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (cursorDot && cursorRing && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.body.classList.add("cursor-ready");

  window.addEventListener("mousemove", (e) => {
    cursorDot.style.left = e.clientX + "px";
    cursorDot.style.top = e.clientY + "px";
    cursorRing.style.left = e.clientX + "px";
    cursorRing.style.top = e.clientY + "px";
  });

  document.querySelectorAll("a, button, .service-card").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
  });
}

// Node network canvas (hero + prospecting section)
// Paused whenever its section is off-screen or the tab is backgrounded.
function initNodeCanvas(canvas, { color = "214,255,74", count = 30 } = {}) {
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height, nodes, rafId = null, isVisible = false;

  function resize() {
    width = canvas.width = canvas.offsetWidth * dpr;
    height = canvas.height = canvas.offsetHeight * dpr;
  }

  function makeNodes() {
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    const maxDist = 150 * dpr;

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.strokeStyle = `rgba(${color}, ${(1 - dist / maxDist) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.fillStyle = `rgba(${color}, 0.9)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8 * dpr, 0, Math.PI * 2);
      ctx.fill();
    });

    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (rafId !== null || !isVisible || document.hidden) return;
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  resize();
  makeNodes();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else play();
  });

  new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible) play();
      else pause();
    },
    { threshold: 0.1 }
  ).observe(canvas);
}

document.querySelectorAll(".node-canvas").forEach((canvas) => {
  initNodeCanvas(canvas, {
    color: canvas.dataset.color || "214,255,74",
    count: Number(canvas.dataset.count) || 30,
  });
});

// Story section visibility (drives bar-chart + other in-view effects)
const storySections = document.querySelectorAll(".story-section");

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.3 }
);

storySections.forEach((el) => storyObserver.observe(el));

// Scroll progress rail
const progressFill = document.querySelector(".progress-rail-fill");

if (progressFill) {
  window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressFill.style.width = pct + "%";
  });
}

// Page transition (fade out before internal navigation)
const pageTransition = document.querySelector(".page-transition");

if (pageTransition && !prefersReducedMotion) {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    const isInternal =
      href &&
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !href.startsWith("mailto:") &&
      link.target !== "_blank";

    if (!isInternal) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      pageTransition.classList.add("is-active");
      window.setTimeout(() => {
        window.location.href = href;
      }, 380);
    });
  });
}

// Intro loader
const loader = document.getElementById("loader");

if (loader) {
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 700);
}

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".navbar nav");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");
  });
}

// Magnetic buttons (rect cached on enter, not recomputed every mousemove)
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    let rect = null;

    btn.addEventListener("mouseenter", () => {
      rect = btn.getBoundingClientRect();
    });

    btn.addEventListener("mousemove", (e) => {
      if (!rect) return;
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      rect = null;
      btn.style.transform = "";
    });
  });
}

