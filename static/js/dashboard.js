// Dashboard JavaScript
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Dashboard loaded - Initializing components")
  initializeDashboard()
})

function initializeDashboard() {
  // Add delete functionality to existing saved items
  addDeleteFunctionality()

  // Add refresh functionality
  addRefreshFunctionality()

  console.log("✅ Dashboard initialized successfully")
}

async function loadDashboardData() {
  try {
    console.log("🤖 Loading AI-powered recommendations...")
    await Promise.all([loadCoursesPreview(), loadCertificatesPreview(), loadJobsPreview()])
    console.log("✅ All AI recommendations loaded successfully")
  } catch (error) {
    console.error("❌ Error loading dashboard data:", error)
  }
}

async function loadCoursesPreview() {
  try {
    const response = await fetch("/api/recommendations/courses")
    const data = await response.json()

    const container = document.getElementById("coursesPreview")
    if (data.recommendations && data.recommendations.length > 0) {
      container.innerHTML = data.recommendations
        .slice(0, 2)
        .map(
          (course) => `
            <div class="preview-item">
              <h4>${course.title}</h4>
              <p><i class="fas fa-graduation-cap"></i> ${course.provider}</p>
              <div class="ai-badge-mini">AI Recommended</div>
            </div>
          `,
        )
        .join("")
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-robot"></i>
          <p>Complete your profile to get AI-powered course recommendations</p>
        </div>
      `
    }
  } catch (error) {
    document.getElementById("coursesPreview").innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading AI recommendations</p>
      </div>
    `
  }
}

async function loadCertificatesPreview() {
  try {
    const response = await fetch("/api/recommendations/certificates")
    const data = await response.json()

    const container = document.getElementById("certificatesPreview")
    if (data.recommendations && data.recommendations.length > 0) {
      container.innerHTML = data.recommendations
        .slice(0, 2)
        .map(
          (cert) => `
            <div class="preview-item">
              <h4>${cert.title}</h4>
              <p><i class="fas fa-certificate"></i> ${cert.provider}</p>
              <div class="ai-badge-mini">ML Suggested</div>
            </div>
          `,
        )
        .join("")
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-brain"></i>
          <p>Complete your profile to get ML-powered certificate suggestions</p>
        </div>
      `
    }
  } catch (error) {
    document.getElementById("certificatesPreview").innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading ML suggestions</p>
      </div>
    `
  }
}

async function loadJobsPreview() {
  try {
    const response = await fetch("/api/recommendations/jobs")
    const data = await response.json()

    const container = document.getElementById("jobsPreview")
    if (data.recommendations && data.recommendations.length > 0) {
      container.innerHTML = data.recommendations
        .slice(0, 2)
        .map(
          (job) => `
            <div class="preview-item">
              <h4>${job.title}</h4>
              <p><i class="fas fa-briefcase"></i> ${job.provider}</p>
              <div class="ai-badge-mini">Smart Match</div>
            </div>
          `,
        )
        .join("")
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>Complete your profile to get intelligent job matches</p>
        </div>
      `
    }
  } catch (error) {
    document.getElementById("jobsPreview").innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading job matches</p>
      </div>
    `
  }
}

function updateProfileProgress() {
  const progressBar = document.getElementById("profileProgress")
  const statusText = document.getElementById("profileStatus")

  if (progressBar && statusText) {
    // Simulate profile completion calculation
    const completion = Math.floor(Math.random() * 100)

    progressBar.style.width = `${completion}%`

    if (completion < 30) {
      statusText.innerHTML =
        '<i class="fas fa-exclamation-circle"></i> Complete your profile to unlock AI recommendations'
      progressBar.style.background = "linear-gradient(90deg, #f44336, #e53935)"
    } else if (completion < 70) {
      statusText.innerHTML = '<i class="fas fa-chart-line"></i> Good progress! Add more details for better AI matching'
      progressBar.style.background = "linear-gradient(90deg, #ff9800, #f57c00)"
    } else {
      statusText.innerHTML =
        '<i class="fas fa-check-circle"></i> Excellent! Your profile is optimized for AI recommendations'
      progressBar.style.background = "linear-gradient(90deg, #4caf50, #45a049)"
    }
  }
}

async function loadSavedItems() {
  try {
    // Load saved certificates
    const certificates = await window.getUserSavedItems("saved_certificates")
    displaySavedItems("savedCertificates", certificates, "certificate")

    // Load saved courses
    const courses = await window.getUserSavedItems("saved_courses")
    displaySavedItems("savedCourses", courses, "course")

    // Load saved job searches
    const jobs = await window.getUserSavedItems("saved_jobs")
    displaySavedItems("savedJobs", jobs, "job_search")
  } catch (error) {
    console.error("Error loading saved items:", error)
  }
}

function displaySavedItems(containerId, items, type) {
  const container = document.getElementById(containerId)

  if (items.length === 0) {
    return // Keep the empty state message
  }

  container.innerHTML = items
    .map((item) => {
      const data = item.data

      if (type === "certificate") {
        return `
                <div class="saved-item">
                    <h4>${data.name}</h4>
                    <p>${data.provider} - ${data.cost}</p>
                    <div class="actions">
                        <a href="${data.url}" target="_blank" class="btn btn-primary btn-small">
                            <i class="fas fa-external-link-alt"></i>
                            View
                        </a>
                        <button class="btn btn-outline btn-small delete-btn" data-id="${item.id}" data-type="${type}">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            `
      } else if (type === "course") {
        return `
                <div class="saved-item">
                    <h4>${data.title}</h4>
                    <p>${data.provider} - ${data.price}</p>
                    <div class="actions">
                        <a href="${data.url}" target="_blank" class="btn btn-primary btn-small">
                            <i class="fas fa-external-link-alt"></i>
                            View
                        </a>
                        <button class="btn btn-outline btn-small delete-btn" data-id="${item.id}" data-type="${type}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `
      } else if (type === "job_search") {
        return `
                <div class="saved-item">
                    <h4>${data.name}</h4>
                    <p>${data.industry} - ${data.company_size}</p>
                    <div class="actions">
                        <a href="https://www.google.com/search?q=${encodeURIComponent(data.search_query)}" 
                           target="_blank" class="btn btn-primary btn-small">
                            <i class="fas fa-search"></i>
                            Search
                        </a>
                        <button class="btn btn-outline btn-small delete-btn" data-id="${item.id}" data-type="${type}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `
      }
    })
    .join("")
}

function addDeleteFunctionality() {
  const deleteButtons = document.querySelectorAll(".delete-btn")

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const itemId = this.getAttribute("data-id")
      const itemType = this.getAttribute("data-type")

      if (confirm("Are you sure you want to remove this item?")) {
        this.disabled = true
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

        try {
          const response = await fetch("/api/delete-saved-item", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: itemId,
              type: itemType,
            }),
          })

          const result = await response.json()

          if (result.success) {
            this.closest(".saved-item").remove()
            window.showNotification("Item removed successfully", "success")

            // Check if section is now empty
            const section = this.closest(".dashboard-section")
            const savedItems = section.querySelectorAll(".saved-item")
            if (savedItems.length === 0) {
              const container = section.querySelector(".saved-items")
              const sectionType = section.querySelector("h2").textContent.toLowerCase()
              let linkPath = "/certificate-finder"
              let linkText = "Find some certificates"

              if (sectionType.includes("course")) {
                linkPath = "/course-suggester"
                linkText = "Get course suggestions"
              } else if (sectionType.includes("job")) {
                linkPath = "/job-helper"
                linkText = "Find companies"
              }

              container.innerHTML = `<p class="empty-state">No saved items yet. <a href="${linkPath}">${linkText}</a></p>`
            }
          } else {
            this.innerHTML = '<i class="fas fa-trash"></i> Remove'
            this.disabled = false
            window.showNotification(result.message || "Failed to remove item", "error")
          }
        } catch (error) {
          console.error("Delete error:", error)
          this.innerHTML = '<i class="fas fa-trash"></i> Remove'
          this.disabled = false
          window.showNotification("Error removing item", "error")
        }
      }
    })
  })
}

function addRefreshFunctionality() {
  // Add refresh buttons to each section
  const sections = document.querySelectorAll(".dashboard-section")

  sections.forEach((section) => {
    const header = section.querySelector("h2")
    if (header && !header.querySelector(".refresh-btn")) {
      const refreshBtn = document.createElement("button")
      refreshBtn.className = "btn btn-outline btn-small refresh-btn"
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>'
      refreshBtn.title = "Refresh"
      refreshBtn.style.marginLeft = "auto"

      // Make header flex to accommodate button
      header.style.display = "flex"
      header.style.alignItems = "center"
      header.style.justifyContent = "space-between"

      header.appendChild(refreshBtn)

      refreshBtn.addEventListener("click", () => refreshSection(section))
    }
  })
}

async function refreshSection(section) {
  const refreshBtn = section.querySelector(".refresh-btn")
  const originalHTML = refreshBtn.innerHTML

  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  refreshBtn.disabled = true

  try {
    // Simulate refresh (in a real app, you'd fetch updated data)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    window.showNotification("Section refreshed", "success")
  } catch (error) {
    window.showNotification("Error refreshing section", "error")
  } finally {
    refreshBtn.innerHTML = originalHTML
    refreshBtn.disabled = false
  }
}

// Dashboard CSS is now loaded from dashboard.css file
// No need to inject styles dynamically
