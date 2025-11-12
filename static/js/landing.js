// Landing page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation toggle
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      navToggle.classList.toggle("active")
    })

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
        navToggle.classList.remove("active")
      })
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (event) => {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navMenu.classList.remove("active")
        navToggle.classList.remove("active")
      }
    })
  }

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 70 // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        })
      }
    })
  })

  // Navbar background on scroll
  const navbar = document.querySelector(".navbar")
  let lastScrollTop = 0

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)"
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "none"
    }

    lastScrollTop = scrollTop
  })

  // Flash message handling
  const flashMessages = document.querySelectorAll(".flash-message")
  flashMessages.forEach((message, index) => {
    // Auto-hide after 5 seconds
    setTimeout(() => {
      message.style.animation = "slideOutRight 0.3s ease-out forwards"
      setTimeout(() => {
        message.remove()
      }, 300)
    }, 5000)

    // Close button functionality
    const closeBtn = message.querySelector(".flash-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        message.style.animation = "slideOutRight 0.3s ease-out forwards"
        setTimeout(() => {
          message.remove()
        }, 300)
      })
    }
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(".feature-card, .about-feature")
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // Observe tech items for animation
  const techItems = document.querySelectorAll(".tech-item")
  techItems.forEach((item, index) => {
    item.style.opacity = "0"
    item.style.transform = "translateY(30px)"
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
    observer.observe(item)
  })

  // Add loading states to buttons
  const ctaButtons = document.querySelectorAll(".btn")
  ctaButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Don't add loading state to anchor links that navigate to other pages
      if (this.getAttribute("href") && !this.getAttribute("href").startsWith("#")) {
        this.classList.add("loading")

        // Remove loading state after navigation (fallback)
        setTimeout(() => {
          this.classList.remove("loading")
        }, 3000)
      }
    })
  })

  // Parallax effect for hero section (subtle)
  const hero = document.querySelector(".hero")
  const heroCircles = document.querySelectorAll(".hero-circle")

  if (hero && heroCircles.length > 0) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * -0.5

      heroCircles.forEach((circle, index) => {
        const speed = (index + 1) * 0.3
        circle.style.transform = `translateY(${rate * speed}px)`
      })
    })
  }

  // Dynamic Stats Counter (if visible)
  const stats = document.querySelectorAll(".stat-number")
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target
          const finalValue = target.textContent
          const numericValue = Number.parseInt(finalValue.replace(/\D/g, ""))

          if (numericValue > 0) {
            animateCounter(target, 0, numericValue, finalValue)
          }

          statsObserver.unobserve(target)
        }
      })
    },
    { threshold: 0.5 },
  )

  stats.forEach((stat) => {
    statsObserver.observe(stat)
  })

  function animateCounter(element, start, end, suffix) {
    const duration = 2000
    const increment = end / (duration / 16)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        current = end
        clearInterval(timer)
      }

      if (suffix.includes("K")) {
        element.textContent = Math.floor(current / 1000) + "K+"
      } else {
        element.textContent = Math.floor(current) + "+"
      }
    }, 16)
  }

  // Keyboard Navigation Support
  document.addEventListener("keydown", (e) => {
    // Close mobile menu with Escape key
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active")
      navToggle.classList.remove("active")
    }
  })

  // Performance: Lazy load background images
  const elementsWithBg = document.querySelectorAll("[data-bg]")
  const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target
        const bgUrl = element.dataset.bg
        element.style.backgroundImage = `url(${bgUrl})`
        bgObserver.unobserve(element)
      }
    })
  })

  elementsWithBg.forEach((element) => {
    bgObserver.observe(element)
  })

  // Console welcome message
  console.log(`
    🚀 CareerCompass - AI-Powered Career Guidance
    ✨ Built with Flask, Gemini AI, and Machine Learning
    🔗 GitHub: https://github.com/your-repo/career-compass
    `)
})

// Add slideOutRight animation for flash messages
const style = document.createElement("style")
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Utility function for smooth page transitions
function smoothTransition(url) {
  document.body.style.opacity = "0.8"
  document.body.style.transition = "opacity 0.3s ease"

  setTimeout(() => {
    window.location.href = url
  }, 300)
}

// Add smooth transitions to navigation links
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll('a[href^="/"]')
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (!this.getAttribute("href").startsWith("#")) {
        e.preventDefault()
        smoothTransition(this.getAttribute("href"))
      }
    })
  })
})

// Utility functions
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `flash-message flash-${type} show`
  notification.innerHTML = `
        <div class="flash-content">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="flash-close">&times;</button>
    `

  // Add to flash container or create one
  let flashContainer = document.querySelector(".flash-container")
  if (!flashContainer) {
    flashContainer = document.createElement("div")
    flashContainer.className = "flash-container"
    document.body.appendChild(flashContainer)
  }

  flashContainer.appendChild(notification)

  // Add close functionality
  const closeBtn = notification.querySelector(".flash-close")
  closeBtn.addEventListener("click", () => {
    notification.style.animation = "slideOutRight 0.3s ease-out forwards"
    setTimeout(() => {
      notification.remove()
    }, 300)
  })

  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out forwards"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 5000)
}

// Export for use in other scripts
window.CareerCompass = {
  showNotification,
}
