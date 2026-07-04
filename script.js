const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Custom cursor
const cursorDot = document.querySelector(".cursor-dot");

if (cursorDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.body.classList.add("cursor-ready");

  window.addEventListener("mousemove", (e) => {
    cursorDot.style.left = e.clientX + "px";
    cursorDot.style.top = e.clientY + "px";
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
    const newWidth = canvas.offsetWidth * dpr;
    const newHeight = canvas.offsetHeight * dpr;
    if (newWidth === width && newHeight === height) return;
    width = canvas.width = newWidth;
    height = canvas.height = newHeight;
    if (width > 0 && height > 0) makeNodes();
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

  // Manual refresh for canvases that were hidden (display:none) when the observer
  // first ran — e.g. inside an inactive tab panel. Called explicitly on tab switch
  // rather than relying on the observer to notice a display-toggle-driven reflow.
  canvas._nodeCanvasRefresh = () => {
    resize();
    isVisible = true;
    play();
  };
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

// Pillar tabs (homepage "Your System" widget)
const pillarTabs = document.querySelectorAll(".pillar-tab");
const pillarPanels = document.querySelectorAll(".pillar-panel");

pillarTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("is-active")) return;

    pillarTabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    const target = tab.dataset.target;
    pillarPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.panel === target);
    });

    // Newly-visible canvases were sized while hidden (0x0) and their IntersectionObserver
    // may not re-fire on a display-toggle reflow — refresh them directly instead.
    requestAnimationFrame(() => {
      const activePanel = document.querySelector('.pillar-panel.is-active');
      const canvas = activePanel && activePanel.querySelector('.node-canvas');
      if (canvas && canvas._nodeCanvasRefresh) canvas._nodeCanvasRefresh();
    });
  });
});

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

// Chat widget — submits via Web3Forms (access key lives in each page's
// hidden "access_key" field, delivers to nicolascojocari@yahoo.fr).
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const chatWidget = document.getElementById("chatWidget");

if (chatWidget) {
  const chatToggle = document.getElementById("chatToggle");
  const chatClose = document.getElementById("chatClose");
  const chatForm = document.getElementById("chatForm");
  const chatEmailInput = document.getElementById("chatEmail");
  const chatMessageInput = document.getElementById("chatMessage");
  const chatNextBtn = chatWidget.querySelector(".chat-next");
  const chatError = document.getElementById("chatError");
  const steps = {
    1: chatWidget.querySelector('.chat-step[data-step="1"]'),
    2: chatWidget.querySelector('.chat-step[data-step="2"]'),
    done: chatWidget.querySelector('.chat-step[data-step="done"]'),
  };

  const openChat = () => chatWidget.classList.add("is-open");
  const closeChat = () => chatWidget.classList.remove("is-open");

  // Teaser popup: invites visitors to chat a few seconds after page load
  const chatTeaser = document.getElementById("chatTeaser");
  const chatTeaserClose = document.getElementById("chatTeaserClose");

  const dismissTeaser = () => {
    if (!chatTeaser) return;
    chatTeaser.classList.remove("is-visible");
    sessionStorage.setItem("chatTeaserDismissed", "1");
  };

  if (chatTeaser && !prefersReducedMotion && !sessionStorage.getItem("chatTeaserDismissed")) {
    window.setTimeout(() => {
      if (!chatWidget.classList.contains("is-open")) {
        chatTeaser.classList.add("is-visible");
      }
    }, 3000);
  }

  if (chatTeaserClose) {
    chatTeaserClose.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissTeaser();
    });
  }

  if (chatTeaser) {
    chatTeaser.addEventListener("click", () => {
      dismissTeaser();
      openChat();
    });
  }

  chatToggle.addEventListener("click", () => {
    dismissTeaser();
    chatWidget.classList.contains("is-open") ? closeChat() : openChat();
  });

  chatClose.addEventListener("click", closeChat);

  chatNextBtn.addEventListener("click", () => {
    if (!chatEmailInput.checkValidity()) {
      chatEmailInput.reportValidity();
      return;
    }
    steps[1].hidden = true;
    steps[2].hidden = false;
    chatMessageInput.focus();
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chatMessageInput.checkValidity()) {
      chatMessageInput.reportValidity();
      return;
    }

    chatError.classList.remove("is-visible");
    const submitBtn = steps[2].querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(chatForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Request failed");

      steps[2].hidden = true;
      steps.done.hidden = false;
    } catch (err) {
      chatError.textContent = "Something went wrong — email us directly at hello@trinity-agency.com instead.";
      chatError.classList.add("is-visible");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
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
const navMenu = document.querySelector(".navbar nav, .story-nav nav");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("is-open");
  });
}

// Mobile: tap "Services" to expand the dropdown instead of navigating
const navDropdownLink = document.querySelector(".nav-dropdown > a");

if (navDropdownLink) {
  navDropdownLink.addEventListener("click", (e) => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      e.preventDefault();
      navDropdownLink.parentElement.classList.toggle("is-open");
    }
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

// Cookie consent banner + Google Consent Mode v2
(function () {
  const CONSENT_KEY = "foundCookieConsent";
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("cookieAccept");
  const declineBtn = document.getElementById("cookieDecline");
  const prefsLinks = document.querySelectorAll(".cookie-prefs-link");

  function updateConsent(granted) {
    if (typeof gtag !== "function") return;
    const state = granted ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
  }

  function showBanner() {
    if (banner) banner.classList.add("is-visible");
  }

  function hideBanner() {
    if (banner) banner.classList.remove("is-visible");
  }

  const saved = localStorage.getItem(CONSENT_KEY);
  if (saved === "granted") {
    updateConsent(true);
  } else if (saved === "denied") {
    updateConsent(false);
  } else if (banner) {
    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "granted");
      updateConsent(true);
      hideBanner();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "denied");
      updateConsent(false);
      hideBanner();
    });
  }

  prefsLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showBanner();
    });
  });
})();

// Newsletter forms (blog band + footer, any page)
document.querySelectorAll(".newsletter-form").forEach((form) => {
  const note =
    form.nextElementSibling && form.nextElementSibling.classList.contains("newsletter-note")
      ? form.nextElementSibling
      : null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "...";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Request failed");
      form.reset();
      if (note) note.textContent = note.dataset.success || "You're on the list — thanks for subscribing.";
    } catch (err) {
      if (note) note.textContent = note.dataset.error || "Something went wrong. Please try again.";
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

// CTA click tracking — pushes a labeled event to dataLayer for every button-styled
// element clicked (nav, hero, pillar tabs, service pages, forms, cookie banner, chat).
// GTM picks this up via a Custom Event trigger listening for "cta_click" and forwards
// cta_label/cta_location/cta_href to GA4 as event parameters.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-primary, .btn-ghost");
  if (!btn) return;

  const section = btn.closest("[id]");
  let location = "unknown";
  if (btn.closest("header")) {
    location = "header_nav";
  } else if (btn.closest("footer")) {
    location = "footer";
  } else if (btn.closest(".chat-widget")) {
    location = "chat_widget";
  } else if (btn.closest(".cookie-banner")) {
    location = "cookie_banner";
  } else if (section) {
    location = section.id;
  } else if (btn.closest(".page-hero")) {
    location = "page_hero";
  } else if (btn.closest(".cta-band")) {
    location = "cta_band";
  } else if (btn.closest(".contact-layout")) {
    location = "contact_form_area";
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "cta_click",
    cta_label: btn.textContent.trim(),
    cta_location: location,
    cta_href: btn.getAttribute("href") || null,
  });
});
