const loader = document.querySelector(".page-loader");
const header = document.querySelector("#site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const progressBar = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
const typingTarget = document.querySelector("#typing-text");
const counters = document.querySelectorAll(".counter");
const contactForm = document.querySelector(".contact-form");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

const typingText = "Java Full Stack Developer | Spring Boot Backend Developer | Problem Solver";
let typingIndex = 0;
let counterStarted = false;

window.addEventListener("load", () => {
  loader.classList.add("hidden");

  if (window.AOS) {
    AOS.init({
      duration: 850,
      easing: "ease-out-cubic",
      once: true,
      offset: 90
    });
  }

  typeLine();
});

function typeLine() {
  if (!typingTarget) return;
  typingTarget.textContent = typingText.slice(0, typingIndex);
  typingIndex += 1;

  if (typingIndex <= typingText.length) {
    window.setTimeout(typeLine, 58);
  }
}

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function updateScrollUi() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  progressBar.style.width = `${progress}%`;
  header.classList.toggle("scrolled", scrollTop > 20);
  backToTop.classList.toggle("show", scrollTop > 650);
  updateActiveLink();
  maybeStartCounters();
}

function updateActiveLink() {
  const fromTop = window.scrollY + 120;

  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;

    const isActive = section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop;
    link.classList.toggle("active", isActive);
  });
}

function maybeStartCounters() {
  if (counterStarted || !counters.length) return;
  const trigger = document.querySelector("#achievements");
  const rect = trigger.getBoundingClientRect();

  if (rect.top < window.innerHeight * 0.78) {
    counterStarted = true;
    counters.forEach(animateCounter);
  }
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const duration = 1300;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

window.addEventListener("scroll", updateScrollUi, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
updateScrollUi();

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector(".send-btn");
  const status = contactForm.querySelector(".form-status");

  button.classList.add("sending");
  button.disabled = true;
  status.textContent = "Preparing your message...";

  window.setTimeout(() => {
    button.classList.remove("sending");
    button.disabled = false;
    status.textContent = "Thanks! Your message is ready to be connected to a backend service.";
    contactForm.reset();
  }, 900);
});

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
    cursorRing.animate(
      { left: `${event.clientX}px`, top: `${event.clientY}px` },
      { duration: 420, fill: "forwards", easing: "ease-out" }
    );
  });

  document.querySelectorAll("a, button, input, textarea").forEach((element) => {
    element.addEventListener("mouseenter", () => cursorRing.classList.add("hover"));
    element.addEventListener("mouseleave", () => cursorRing.classList.remove("hover"));
  });

  document.querySelectorAll(".glass-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((0.5 - y / rect.height)) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("click", (event) => {
      const spark = document.createElement("span");
      spark.className = "click-spark";
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      document.body.appendChild(spark);
      spark.addEventListener("animationend", () => spark.remove(), { once: true });
    });
  });
}

const canvas = document.querySelector("#particle-canvas");
const context = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  const amount = Math.min(Math.floor(window.innerWidth / 13), 110);
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.8 + 0.7,
    speedX: (Math.random() - 0.5) * 0.45,
    speedY: (Math.random() - 0.5) * 0.45,
    alpha: Math.random() * 0.45 + 0.25
  }));
}

function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > window.innerWidth) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > window.innerHeight) particle.speedY *= -1;

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(37, 194, 255, ${particle.alpha})`;
    context.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 118) {
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(168, 85, 247, ${0.14 * (1 - distance / 118)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();

document.querySelectorAll(".hero-visual, .floating-icon").forEach((element) => {
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.035;
    element.style.setProperty("--parallax", `${offset}px`);
  }, { passive: true });
});
