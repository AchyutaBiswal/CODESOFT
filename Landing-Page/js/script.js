const body = document.body;
const loader = document.querySelector(".loader");
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const progressBar = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const canvas = document.querySelector(".particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let counterStarted = false;

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
  }, 450);
});

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  });
});

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;
  header.classList.toggle("is-scrolled", scrollTop > 30);
  backToTop.classList.toggle("is-visible", scrollTop > 520);

  let currentSection = null;
  document.querySelectorAll("main section[id]").forEach((section) => {
    if (scrollTop >= section.offsetTop - 120) {
      currentSection = section;
    }
  });

  if (currentSection) {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${currentSection.id}`);
    });
  }
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function animateCounters() {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.target);
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased).toLocaleString("en-IN");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString("en-IN");
      }
    }

    requestAnimationFrame(update);
  });
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !counterStarted) {
      counterStarted = true;
      animateCounters();
      statsObserver.disconnect();
    }
  },
  { threshold: 0.4 }
);

const statsSection = document.querySelector(".stats");
if (statsSection) statsObserver.observe(statsSection);

document.querySelectorAll(".ripple").forEach((button) => {
  button.addEventListener("click", (event) => {
    const circle = document.createElement("span");
    const rect = button.getBoundingClientRect();

    circle.className = "ripple-circle";
    circle.style.left = `${event.clientX - rect.left}px`;
    circle.style.top = `${event.clientY - rect.top}px`;

    button.appendChild(circle);
    window.setTimeout(() => circle.remove(), 700);
  });
});

document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panel = trigger.nextElementSibling;
    const expanded = trigger.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".accordion-trigger").forEach((item) => {
      item.setAttribute("aria-expanded", "false");
      item.nextElementSibling.style.maxHeight = null;
    });

    if (!expanded) {
      trigger.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  });
});

const track = document.querySelector(".testimonial-track");
const slides = document.querySelectorAll(".testimonial-card");
const dotsContainer = document.querySelector(".slider-dots");
let activeSlide = 0;
let sliderTimer;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${activeSlide * 100}%)`;

  dotsContainer.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeSlide);
  });
}

function startSlider() {
  sliderTimer = window.setInterval(() => showSlide(activeSlide + 1), 4200);
}

slides.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
  dot.addEventListener("click", () => {
    window.clearInterval(sliderTimer);
    showSlide(index);
    startSlider();
  });
  dotsContainer.appendChild(dot);
});

showSlide(0);
startSlider();

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".form-status");

  status.textContent = "Thanks for reaching out. The SkillForge team will contact you soon.";
  form.reset();
});

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const deviceRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = rect.width * deviceRatio;
  canvas.height = rect.height * deviceRatio;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);

  particles = Array.from({ length: Math.min(70, Math.floor(rect.width / 12)) }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    size: Math.random() * 2 + 0.8,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.55 + 0.2
  }));
}

function drawParticles() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(103, 232, 249, ${particle.alpha})`;
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);

      if (distance < 115) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(99, 102, 241, ${0.18 * (1 - distance / 115)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener("resize", resizeCanvas);
