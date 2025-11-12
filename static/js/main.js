// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 CareerCompass AI Platform Loaded")

  // Initialize modal functionality
  initializeModals()

  // Initialize smooth scrolling
  initializeSmoothScrolling()

  // Show loading animations
  showLoadingAnimations()

  // Initialize save functionality
  initializeSaveFunctionality()

  // Load user's saved items to check save states
  loadUserSavedItems()
})

// Store user's saved items for quick lookup
const userSavedItems = {
  certificates: [],
  courses: [],
  jobs: [],
}

function initializeModals() {
  const modals = document.querySelectorAll(".modal")
  const closeButtons = document.querySelectorAll(".close")

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal")
      modal.style.display = "none"
    })
  })

  window.addEventListener("click", (event) => {
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })
}

function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

function showLoadingAnimations() {
  // Add loading animations to cards
  const cards = document.querySelectorAll(".feature-card, .form-card, .result-card")
  cards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"

    setTimeout(() => {
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
    }, index * 100)
  })
}

async function loadUserSavedItems() {
  try {
    // Load all saved items to check save states
    const [certificates, courses, jobs] = await Promise.all([
      fetch("/api/get-saved-items/certificate").then((r) => r.json()),
      fetch("/api/get-saved-items/course").then((r) => r.json()),
      fetch("/api/get-saved-items/job").then((r) => r.json()),
    ])

    if (certificates.success) userSavedItems.certificates = certificates.items
    if (courses.success) userSavedItems.courses = courses.items
    if (jobs.success) userSavedItems.jobs = jobs.items

    // Update save button states
    updateSaveButtonStates()
  } catch (error) {
    console.log("User not logged in or error loading saved items")
  }
}

function updateSaveButtonStates() {
  // Update all save buttons based on saved items
  document.querySelectorAll(".save-btn").forEach((button) => {
    const itemType = button.getAttribute("data-type")
    const itemData = button.getAttribute("data-item")

    if (itemData) {
      try {
        const parsedData = JSON.parse(itemData)
        const isAlreadySaved = checkIfItemSaved(itemType, parsedData)

        if (isAlreadySaved) {
          updateButtonToUnsaveState(button, isAlreadySaved.id)
        }
      } catch (error) {
        console.error("Error parsing item data:", error)
      }
    }
  })
}

function checkIfItemSaved(itemType, itemData) {
  const savedItems = userSavedItems[`${itemType}s`] || []

  return savedItems.find((savedItem) => {
    if (itemType === "certificate") {
      return savedItem.name === itemData.name && savedItem.provider === itemData.provider
    } else if (itemType === "course") {
      return savedItem.title === itemData.title && savedItem.provider === itemData.provider
    } else if (itemType === "job") {
      return savedItem.name === itemData.name && savedItem.industry === itemData.industry
    }
    return false
  })
}

function updateButtonToSaveState(button) {
  button.innerHTML = '<i class="fas fa-bookmark"></i> Save'
  button.classList.remove("btn-success", "btn-warning")
  button.classList.add("btn-secondary")
  button.setAttribute("data-action", "save")
  button.disabled = false
}

function updateButtonToUnsaveState(button, savedItemId) {
  button.innerHTML = '<i class="fas fa-bookmark-solid"></i> Saved'
  button.classList.remove("btn-secondary")
  button.classList.add("btn-success")
  button.setAttribute("data-action", "unsave")
  button.setAttribute("data-saved-id", savedItemId)
  button.disabled = false
}

function initializeSaveFunctionality() {
  // Initialize save buttons for dynamically loaded content
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("save-btn") || event.target.closest(".save-btn")) {
      const button = event.target.classList.contains("save-btn") ? event.target : event.target.closest(".save-btn")
      await handleSaveUnsaveItem(button)
    }
  })
}

async function handleSaveUnsaveItem(button) {
  const action = button.getAttribute("data-action") || "save"
  const itemType = button.getAttribute("data-type")
  const itemData = button.getAttribute("data-item")
  const savedItemId = button.getAttribute("data-saved-id")
  const originalHTML = button.innerHTML

  if (!itemData && action === "save") {
    showNotification("Error: No item data found", "error")
    return
  }

  try {
    // Update button state
    button.disabled = true

    if (action === "save") {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'
      await saveItem(button, itemType, itemData)
    } else {
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...'
      await unsaveItem(button, itemType, savedItemId)
    }
  } catch (error) {
    console.error("Save/Unsave error:", error)
    button.innerHTML = originalHTML
    button.disabled = false
    showNotification("Error processing request", "error")
  }
}

async function saveItem(button, itemType, itemData) {
  try {
    const parsedData = JSON.parse(itemData)

    const response = await fetch("/api/save-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: itemType,
        data: parsedData,
      }),
    })

    const result = await response.json()

    if (result.success) {
      // Update local saved items
      userSavedItems[`${itemType}s`].push({
        id: result.item_id || Date.now().toString(),
        ...parsedData,
      })

      // Update button to unsave state
      updateButtonToUnsaveState(button, result.item_id || Date.now().toString())

      showNotification(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} saved successfully!`, "success")
    } else {
      updateButtonToSaveState(button)
      showNotification(result.message || "Failed to save item", "error")
    }
  } catch (error) {
    updateButtonToSaveState(button)
    throw error
  }
}

async function unsaveItem(button, itemType, savedItemId) {
  try {
    const response = await fetch("/api/delete-saved-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: itemType,
        id: savedItemId,
      }),
    })

    const result = await response.json()

    if (result.success) {
      // Update local saved items
      userSavedItems[`${itemType}s`] = userSavedItems[`${itemType}s`].filter((item) => item.id !== savedItemId)

      // Update button to save state
      updateButtonToSaveState(button)

      showNotification(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removed successfully!`, "success")
    } else {
      updateButtonToUnsaveState(button, savedItemId)
      showNotification(result.message || "Failed to remove item", "error")
    }
  } catch (error) {
    updateButtonToUnsaveState(button, savedItemId)
    throw error
  }
}

// Utility functions
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
            <span>${message}</span>
        </div>
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// API helper functions
async function apiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "same-origin",
      ...options,
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error) {
    console.error("API request failed:", error)
    return { success: false, error: error.message }
  }
}

// Form validation
function validateForm(formElement) {
  const checkboxGroups = formElement.querySelectorAll('input[type="checkbox"]')
  const radioGroups = formElement.querySelectorAll('input[type="radio"]')
  const selects = formElement.querySelectorAll("select")

  let isValid = true

  // Validate checkbox groups
  const checkboxNames = [...new Set([...checkboxGroups].map((cb) => cb.name))]
  checkboxNames.forEach((name) => {
    const checkboxes = formElement.querySelectorAll(`input[name="${name}"]`)
    const checked = [...checkboxes].some((cb) => cb.checked)
    const errorElement = document.getElementById(`${name.replace("_", "")}Error`)

    if (!checked && errorElement) {
      errorElement.classList.add("show")
      isValid = false
    } else if (errorElement) {
      errorElement.classList.remove("show")
    }
  })

  // Validate radio groups
  const radioNames = [...new Set([...radioGroups].map((rb) => rb.name))]
  radioNames.forEach((name) => {
    const radios = formElement.querySelectorAll(`input[name="${name}"]`)
    const checked = [...radios].some((rb) => rb.checked)
    const errorElement = document.getElementById(`${name}Error`)

    if (!checked && errorElement) {
      errorElement.classList.add("show")
      isValid = false
    } else if (errorElement) {
      errorElement.classList.remove("show")
    }
  })

  // Validate selects
  selects.forEach((select) => {
    const errorElement = document.getElementById(`${select.name}Error`)

    if (!select.value && errorElement) {
      errorElement.classList.add("show")
      isValid = false
    } else if (errorElement) {
      errorElement.classList.remove("show")
    }
  })

  return isValid
}

// Loading states
function setLoading(element, isLoading) {
  if (isLoading) {
    element.disabled = true
    const originalText = element.textContent
    element.setAttribute("data-original-text", originalText)
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
    element.classList.add("loading")
  } else {
    element.disabled = false
    const originalText = element.getAttribute("data-original-text")
    element.textContent = originalText || "Submit"
    element.classList.remove("loading")
  }
}

// Parse AI response
function parseAIResponse(responseText) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // If no JSON found, return the text as is
    return { error: "Could not parse AI response", raw: responseText }
  } catch (error) {
    console.error("Parse error:", error)
    return { error: "Invalid JSON response", raw: responseText }
  }
}

// Export utility functions
window.showNotification = showNotification
window.apiRequest = apiRequest
window.validateForm = validateForm
window.setLoading = setLoading
window.parseAIResponse = parseAIResponse
window.updateSaveButtonStates = updateSaveButtonStates
window.userSavedItems = userSavedItems
