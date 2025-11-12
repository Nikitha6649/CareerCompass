// Recommendations JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
})

function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      this.classList.add("active")
      document.getElementById(`${targetTab}-tab`).classList.add("active")
    })
  })
}

// Function to refresh recommendations
async function refreshRecommendations(type) {
  try {
    const response = await fetch(`/api/recommendations/${type}`)
    const recommendations = await response.json()

    const container = document.getElementById(`${type}Grid`)

    if (recommendations.length > 0) {
      container.innerHTML = recommendations.map((item) => createRecommendationCard(item, type)).join("")
    } else {
      container.innerHTML = `<p>No ${type} recommendations available. Please update your profile.</p>`
    }
  } catch (error) {
    console.error(`Error loading ${type}:`, error)
  }
}

function createRecommendationCard(item, type) {
  return `
        <div class="recommendation-card">
            <div class="card-header">
                <h3>${item.title}</h3>
                <span class="provider">${item.provider}</span>
            </div>
            <div class="card-content">
                <p>${item.description}</p>
                ${
                  type === "jobs"
                    ? `
                    <div class="job-meta">
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${item.location || "Remote"}</span>
                        <span class="experience"><i class="fas fa-briefcase"></i> ${item.experience_level || "All levels"}</span>
                        <span class="salary"><i class="fas fa-dollar-sign"></i> ${item.salary_range || "Competitive"}</span>
                    </div>
                `
                    : ""
                }
            </div>
            <div class="card-actions">
                <a href="${item.url}" target="_blank" class="btn btn-primary">
                    ${type === "jobs" ? "Apply Now" : type === "courses" ? "View Course" : "Learn More"}
                </a>
            </div>
        </div>
    `
}
