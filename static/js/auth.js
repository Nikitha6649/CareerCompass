// Authentication JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const loginForm = document.getElementById("loginForm")
  const modal = document.getElementById("messageModal")
  const closeModal = document.querySelector(".close")

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Modal functionality
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none"
    })
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
    }
  })
})

function showModal(message, type = "info") {
  const modal = document.getElementById("messageModal")
  const modalMessage = document.getElementById("modalMessage")
  const modalIcon = document.querySelector(".modal-icon i")

  modalMessage.textContent = message

  // Update icon based on type
  modalIcon.className =
    type === "error" ? "fas fa-exclamation-circle" : type === "success" ? "fas fa-check-circle" : "fas fa-info-circle"

  // Update icon container color
  const iconContainer = document.querySelector(".modal-icon")
  iconContainer.style.background = type === "error" ? "#fee2e2" : type === "success" ? "#dcfce7" : "#fef3c7"

  modalIcon.style.color = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#d97706"

  modal.style.display = "block"
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

function setLoading(button, loading) {
  if (loading) {
    button.classList.add("loading")
    button.disabled = true
    button.setAttribute("data-original-text", button.textContent)
    button.textContent = "Loading..."
  } else {
    button.classList.remove("loading")
    button.disabled = false
    const originalText = button.getAttribute("data-original-text")
    button.textContent = originalText || "Submit"
  }
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  const formGroup = field.closest(".form-group")

  // Remove existing error
  const existingError = formGroup.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }

  // Add error class and message
  formGroup.classList.add("error")

  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message show"
  errorDiv.textContent = message

  field.parentNode.appendChild(errorDiv)
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId)
  const formGroup = field.closest(".form-group")

  formGroup.classList.remove("error")
  formGroup.classList.add("success")

  const errorMessage = formGroup.querySelector(".error-message")
  if (errorMessage) {
    errorMessage.remove()
  }
}

function clearAllErrors() {
  const formGroups = document.querySelectorAll(".form-group")
  formGroups.forEach((group) => {
    group.classList.remove("error", "success")
    const errorMessage = group.querySelector(".error-message")
    if (errorMessage) {
      errorMessage.remove()
    }
  })
}

async function handleRegister(event) {
  event.preventDefault()
  clearAllErrors()

  const formData = new FormData(event.target)
  const data = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  // Client-side validation
  let hasErrors = false

  if (!data.fullName || data.fullName.trim().length < 2) {
    showFieldError("fullName", "Please enter your full name")
    hasErrors = true
  }

  if (!data.email) {
    showFieldError("email", "Please enter your email address")
    hasErrors = true
  } else if (!validateEmail(data.email)) {
    showFieldError("email", "Please enter a valid email address")
    hasErrors = true
  }

  if (!data.password) {
    showFieldError("password", "Please enter a password")
    hasErrors = true
  } else if (!validatePassword(data.password)) {
    showFieldError("password", "Password must be at least 6 characters long")
    hasErrors = true
  }

  if (!data.confirmPassword) {
    showFieldError("confirmPassword", "Please confirm your password")
    hasErrors = true
  } else if (data.password !== data.confirmPassword) {
    showFieldError("confirmPassword", "Passwords do not match")
    hasErrors = true
  }

  if (hasErrors) {
    return
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  setLoading(submitButton, true)

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success) {
      showModal("Registration successful! Redirecting to dashboard...", "success")
      setTimeout(() => {
        window.location.href = result.redirect || "/dashboard"
      }, 2000)
    } else {
      showModal(result.message || "Registration failed", "error")
    }
  } catch (error) {
    console.error("Registration error:", error)
    showModal("An error occurred. Please try again.", "error")
  } finally {
    setLoading(submitButton, false)
  }
}

async function handleLogin(event) {
  event.preventDefault()
  clearAllErrors()

  const formData = new FormData(event.target)
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  // Client-side validation
  let hasErrors = false

  if (!data.email) {
    showFieldError("email", "Please enter your email address")
    hasErrors = true
  } else if (!validateEmail(data.email)) {
    showFieldError("email", "Please enter a valid email address")
    hasErrors = true
  }

  if (!data.password) {
    showFieldError("password", "Please enter your password")
    hasErrors = true
  }

  if (hasErrors) {
    return
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  setLoading(submitButton, true)

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success) {
      showModal("Login successful! Redirecting to dashboard...", "success")
      setTimeout(() => {
        window.location.href = result.redirect || "/dashboard"
      }, 1000)
    } else {
      showModal(result.message || "Login failed", "error")
    }
  } catch (error) {
    console.error("Login error:", error)
    showModal("An error occurred. Please try again.", "error")
  } finally {
    setLoading(submitButton, false)
  }
}

// Real-time validation
document.addEventListener("input", (event) => {
  if (event.target.type === "email") {
    if (validateEmail(event.target.value)) {
      clearFieldError(event.target.id)
    }
  }

  if (event.target.type === "password") {
    if (event.target.name === "password" && validatePassword(event.target.value)) {
      clearFieldError(event.target.id)
    }

    if (event.target.name === "confirmPassword") {
      const password = document.getElementById("password")
      if (password && event.target.value === password.value) {
        clearFieldError(event.target.id)
      }
    }
  }

  if (event.target.name === "fullName" && event.target.value.trim().length >= 2) {
    clearFieldError(event.target.id)
  }
})
