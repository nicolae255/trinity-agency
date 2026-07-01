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

// Magnetic buttons
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".btn-primary").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

