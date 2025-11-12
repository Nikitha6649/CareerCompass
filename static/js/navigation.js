// Navigation and Authentication JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  initializeFlashMessages()
})

function initializeNavigation() {
  const logoutBtn = document.getElementById("logoutBtn")

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }
}

async function handleLogout() {
  try {
    const response = await fetch("/logout", {
      method: "GET",
      credentials: "same-origin",
    })

    if (response.ok) {
      showNotification("Logged out successfully!", "success")
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } else {
      showNotification("Error logging out", "error")
    }
  } catch (error) {
    console.error("Logout error:", error)
    showNotification("Error logging out", "error")
  }
}

function initializeFlashMessages() {
  const flashMessages = document.querySelectorAll(".flash-message")

  flashMessages.forEach((message) => {
    const closeBtn = message.querySelector(".flash-close")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        message.style.opacity = "0"
        setTimeout(() => {
          message.remove()
        }, 300)
      })
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = "0"
        setTimeout(() => {
          message.remove()
        }, 300)
      }
    }, 5000)
  })
}

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

// Make showNotification available globally
window.showNotification = showNotification
