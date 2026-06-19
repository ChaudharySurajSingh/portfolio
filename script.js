const portfolioSelectors = {
  navigationLinks: ".site-navigation a",
  revealElements:
    ".section-heading, .about-section, .project-card, .strength-card, .expertise-card, .skill-card, .education-card, .contact-content, .contact-form-panel",
  contactForm: "#contact-form",
  formStatus: "#contact-form-status",
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function initializePortfolioExperience() {
  animateHeroSection();
  animateSectionsOnScroll();
  initializeNavigationState();
  setupContactForm();
}

function animateHeroSection() {
  const heroElements = document.querySelectorAll(
    ".hero-eyebrow, .hero-title, .hero-tagline, .hero-actions, .impact-metric, .hero-visual",
  );

  heroElements.forEach((heroElement, animationIndex) => {
    heroElement.style.setProperty(
      "--animation-delay",
      `${animationIndex * 75}ms`,
    );
    heroElement.classList.add("page-load-enter");
  });
}

function animateSectionsOnScroll() {
  const animatedElements = document.querySelectorAll(
    portfolioSelectors.revealElements,
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    animatedElements.forEach((animatedElement) =>
      animatedElement.classList.add("is-visible"),
    );
    return;
  }

  animatedElements.forEach((animatedElement, animationIndex) => {
    animatedElement.classList.add("scroll-reveal");
    animatedElement.style.setProperty(
      "--animation-delay",
      `${Math.min(animationIndex % 8, 6) * 55}ms`,
    );
  });

  const animationObserver = new IntersectionObserver(
    (observerEntries) => {
      observerEntries.forEach((observerEntry) => {
        if (!observerEntry.isIntersecting) return;
        observerEntry.target.classList.add("is-visible");
        animationObserver.unobserve(observerEntry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -64px 0px",
    },
  );

  animatedElements.forEach((animatedElement) =>
    animationObserver.observe(animatedElement),
  );
}

function initializeNavigationState() {
  const portfolioSections = document.querySelectorAll("main section[id]");
  const navigationLinks = document.querySelectorAll(
    portfolioSelectors.navigationLinks,
  );

  if (!("IntersectionObserver" in window)) return;

  const navigationObserver = new IntersectionObserver(
    (observerEntries) => {
      observerEntries.forEach((observerEntry) => {
        if (!observerEntry.isIntersecting) return;

        navigationLinks.forEach((navigationLink) => {
          const matchesCurrentSection =
            navigationLink.getAttribute("href") ===
            `#${observerEntry.target.id}`;
          navigationLink.classList.toggle("is-active", matchesCurrentSection);
        });
      });
    },
    {
      threshold: 0.38,
      rootMargin: "-18% 0px -55% 0px",
    },
  );

  portfolioSections.forEach((portfolioSection) =>
    navigationObserver.observe(portfolioSection),
  );
}

function setupContactForm() {
  const contactForm = document.querySelector(portfolioSelectors.contactForm);
  const formStatus = document.querySelector(portfolioSelectors.formStatus);

  if (!contactForm) return;

  contactForm.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();

    const contactFormValues = getContactFormValues(contactForm);

    if (!isContactFormValid(contactFormValues, contactForm)) {
      updateFormStatus(
        formStatus,
        "Please complete all fields before sending.",
        "error",
      );
      return;
    }

    const mailtoLink = createMailtoLink(contactFormValues);
    updateFormStatus(
      formStatus,
      "Opening your email app with a prepared message.",
      "success",
    );

    window.location.href = mailtoLink;

    setTimeout(() => {
      contactForm.reset();
      updateFormStatus(formStatus, "", "");
    }, 3000);
  });
}

function getContactFormValues(contactForm) {
  const formFields = new FormData(contactForm);

  return {
    senderName: String(formFields.get("name") || "").trim(),
    senderEmail: String(formFields.get("email") || "").trim(),
    senderMessage: String(formFields.get("message") || "").trim(),
  };
}

function isContactFormValid(contactFormValues, contactForm) {
  const hasRequiredFields =
    contactFormValues.senderName &&
    contactFormValues.senderEmail &&
    contactFormValues.senderMessage;

  if (!hasRequiredFields) {
    contactForm.reportValidity();
    return false;
  }

  const hasValidFieldFormats = contactForm.checkValidity();

  if (!hasValidFieldFormats) {
    contactForm.reportValidity();
  }

  return hasValidFieldFormats;
}

function createMailtoLink(contactFormValues) {
  const subject = encodeURIComponent(
    `Portfolio inquiry from ${contactFormValues.senderName}`,
  );
  const messageBody = encodeURIComponent(
    `Message: ${contactFormValues.senderMessage}\n\nFrom: ${contactFormValues.senderName}\nReply to: ${contactFormValues.senderEmail}`,
  );

  const base = `mailto:surajsingh.dev89@gmail.com?subject=${subject}&body=`;
  const trimmedBody = messageBody.slice(0, 1800);

  return `${base}${trimmedBody}`;
}

function updateFormStatus(formStatus, statusMessage, statusType) {
  if (!formStatus) return;

  formStatus.textContent = statusMessage;
  formStatus.dataset.status = statusType;
}

initializePortfolioExperience();
