// Enhanced recommendations with AI integration
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
  initializeFilters()
  loadAIInsights()
  initializeTracking()
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

      // Load AI insights for the selected tab
      loadAIInsightsForTab(targetTab)
    })
  })
}

function initializeFilters() {
  // Course filters
  const difficultyFilter = document.getElementById("difficultyFilter")
  const categoryFilter = document.getElementById("categoryFilter")

  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", filterCourses)
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterCourses)
  }

  // Job filters
  const experienceFilter = document.getElementById("experienceFilter")
  const remoteFilter = document.getElementById("remoteFilter")

  if (experienceFilter) {
    experienceFilter.addEventListener("change", filterJobs)
  }

  if (remoteFilter) {
    remoteFilter.addEventListener("change", filterJobs)
  }
}

function filterCourses() {
  const difficultyFilter = document.getElementById("difficultyFilter").value
  const categoryFilter = document.getElementById("categoryFilter").value
  const courseCards = document.querySelectorAll("#coursesGrid .recommendation-card")

  courseCards.forEach((card) => {
    const difficulty = card.getAttribute("data-difficulty")
    const category = card.getAttribute("data-category")

    const matchesDifficulty = !difficultyFilter || difficulty === difficultyFilter
    const matchesCategory = !categoryFilter || category === categoryFilter

    if (matchesDifficulty && matchesCategory) {
      card.style.display = "block"
      card.style.animation = "fadeInUp 0.5s ease-out"
    } else {
      card.style.display = "none"
    }
  })
}

function filterJobs() {
  const experienceFilter = document.getElementById("experienceFilter").value
  const remoteFilter = document.getElementById("remoteFilter").value
  const jobCards = document.querySelectorAll("#jobsGrid .recommendation-card")

  jobCards.forEach((card) => {
    const experience = card.getAttribute("data-experience")
    const remote = card.getAttribute("data-remote")

    const matchesExperience = !experienceFilter || experience === experienceFilter
    const matchesRemote = !remoteFilter || remote === remoteFilter

    if (matchesExperience && matchesRemote) {
      card.style.display = "block"
      card.style.animation = "fadeInUp 0.5s ease-out"
    } else {
      card.style.display = "none"
    }
  })
}

async function loadAIInsights() {
  // Load initial AI insights for courses (default tab)
  loadAIInsightsForTab("courses")
}

async function loadAIInsightsForTab(tabType) {
  const insightsContainer = document.getElementById("aiInsights")

  if (!insightsContainer) return

  insightsContainer.innerHTML =
    '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Generating AI insights...</div>'

  try {
    const response = await fetch(`/api/recommendations/${tabType}`)
    const data = await response.json()

    if (data.ai_insights) {
      displayAIInsights(data.ai_insights, tabType)
    } else {
      insightsContainer.innerHTML = `<p>AI insights for ${tabType} will be available soon...</p>`
    }
  } catch (error) {
    console.error("Error loading AI insights:", error)
    insightsContainer.innerHTML = "<p>Unable to load AI insights at this time.</p>"
  }
}

function displayAIInsights(insights, tabType) {
  const insightsContainer = document.getElementById("aiInsights")

  try {
    // Try to parse as JSON if it's a string
    const parsedInsights = typeof insights === "string" ? JSON.parse(insights) : insights

    const html = `
      <div class="ai-insight-section">
        <h4><i class="fas fa-lightbulb"></i> AI Recommendations for ${tabType.charAt(0).toUpperCase() + tabType.slice(1)}</h4>
        <div class="insight-content">
          ${
            parsedInsights.recommendations
              ? `
            <div class="insight-item">
              <strong>Top Recommendations:</strong>
              <ul>
                ${parsedInsights.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
          
          ${
            parsedInsights.reasoning
              ? `
            <div class="insight-item">
              <strong>Why These Recommendations:</strong>
              <p>${parsedInsights.reasoning}</p>
            </div>
          `
              : ""
          }
          
          ${
            parsedInsights.skills_gap
              ? `
            <div class="insight-item">
              <strong>Skills Gap Analysis:</strong>
              <p>${parsedInsights.skills_gap}</p>
            </div>
          `
              : ""
          }
          
          ${
            parsedInsights.career_advice
              ? `
            <div class="insight-item">
              <strong>Career Advice:</strong>
              <p>${parsedInsights.career_advice}</p>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `

    insightsContainer.innerHTML = html
  } catch (error) {
    // If parsing fails, display as plain text
    insightsContainer.innerHTML = `
      <div class="ai-insight-section">
        <h4><i class="fas fa-robot"></i> AI Analysis</h4>
        <div class="insight-content">
          <p>${insights}</p>
        </div>
      </div>
    `
  }
}

function initializeTracking() {
  const trackButtons = document.querySelectorAll(".track-btn")

  trackButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const itemType = this.getAttribute("data-type")
      const itemId = this.getAttribute("data-id")

      // Visual feedback
      this.classList.add("loading")

      try {
        const response = await fetch("/api/track-interaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_type: itemType,
            item_id: Number.parseInt(itemId),
            interaction_type: "save",
          }),
        })

        if (response.ok) {
          this.classList.remove("loading")
          this.classList.add("saved")
          this.innerHTML = '<i class="fas fa-check"></i> Saved'

          // Show success message
          showNotification("Item saved to your profile!", "success")
        }
      } catch (error) {
        console.error("Error tracking interaction:", error)
        this.classList.remove("loading")
        showNotification("Error saving item", "error")
      }
    })
  })

  // Initialize career path exploration
  const exploreButtons = document.querySelectorAll(".explore-path")
  exploreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const pathName = this.getAttribute("data-path")
      exploreCareerPath(pathName)
    })
  })
}

async function exploreCareerPath(pathName) {
  try {
    const response = await fetch("/api/career-path-prediction")
    const careerPaths = await response.json()

    const selectedPath = careerPaths.find((path) => path.name === pathName)

    if (selectedPath) {
      showCareerPathModal(selectedPath)
    }
  } catch (error) {
    console.error("Error exploring career path:", error)
    showNotification("Error loading career path details", "error")
  }
}

function showCareerPathModal(careerPath) {
  const modal = document.createElement("div")
  modal.className = "modal career-path-modal"
  modal.innerHTML = `
    <div class="modal-content career-path-content">
      <span class="close">&times;</span>
      <div class="career-path-header">
        <h2>${careerPath.name}</h2>
        <div class="path-stats">
          <div class="stat-item">
            <i class="fas fa-dollar-sign"></i>
            <span>${careerPath.average_salary}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-chart-line"></i>
            <span>${careerPath.growth_rate} growth</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-industry"></i>
            <span>${careerPath.industry}</span>
          </div>
        </div>
      </div>
      <div class="career-path-body">
        <p>${careerPath.description}</p>
        <div class="required-skills">
          <h4>Required Skills:</h4>
          <div class="skills-tags">
            ${careerPath.required_skills
              .split(", ")
              .map((skill) => `<span class="skill-tag">${skill}</span>`)
              .join("")}
          </div>
        </div>
        <div class="path-actions">
          <button class="btn btn-primary" onclick="getPathRecommendations('${careerPath.name}')">
            <i class="fas fa-route"></i>
            Get Learning Path
          </button>
          <button class="btn btn-secondary" onclick="findRelatedJobs('${careerPath.name}')">
            <i class="fas fa-briefcase"></i>
            Find Jobs
          </button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  modal.style.display = "block"

  // Close modal functionality
  const closeBtn = modal.querySelector(".close")
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(modal)
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })
}

async function getPathRecommendations(pathName) {
  showNotification("Generating personalized learning path...", "info")

  try {
    // This would integrate with the AI system to generate a learning path
    const response = await fetch("/api/recommendations/courses")
    const data = await response.json()

    // Filter courses relevant to the career path
    const relevantCourses = data.recommendations.slice(0, 3)

    let pathHtml = `
      <div class="learning-path">
        <h4>Recommended Learning Path for ${pathName}</h4>
        <div class="path-steps">
    `

    relevantCourses.forEach((course, index) => {
      pathHtml += `
        <div class="path-step">
          <div class="step-number">${index + 1}</div>
          <div class="step-content">
            <h5>${course.title}</h5>
            <p>${course.provider}</p>
            <a href="${course.url}" target="_blank" class="btn btn-sm btn-primary">Start Course</a>
          </div>
        </div>
      `
    })

    pathHtml += `
        </div>
      </div>
    `

    // Update the modal content
    const modalBody = document.querySelector(".career-path-body")
    modalBody.innerHTML += pathHtml
  } catch (error) {
    console.error("Error generating learning path:", error)
    showNotification("Error generating learning path", "error")
  }
}

async function findRelatedJobs(pathName) {
  showNotification("Finding relevant job opportunities...", "info")

  try {
    const response = await fetch("/api/recommendations/jobs")
    const data = await response.json()

    // Filter jobs relevant to the career path
    const relevantJobs = data.recommendations.slice(0, 3)

    let jobsHtml = `
      <div class="related-jobs">
        <h4>Job Opportunities in ${pathName}</h4>
        <div class="jobs-list">
    `

    relevantJobs.forEach((job) => {
      jobsHtml += `
        <div class="job-item">
          <h5>${job.title}</h5>
          <p>${job.provider}</p>
          <a href="${job.url}" target="_blank" class="btn btn-sm btn-primary">View Job</a>
        </div>
      `
    })

    jobsHtml += `
        </div>
      </div>
    `

    // Update the modal content
    const modalBody = document.querySelector(".career-path-body")
    modalBody.innerHTML += jobsHtml
  } catch (error) {
    console.error("Error finding related jobs:", error)
    showNotification("Error finding related jobs", "error")
  }
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

  // Show notification
  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Refresh recommendations with new AI insights
async function refreshRecommendations(type) {
  const container = document.getElementById(`${type}Grid`)
  const loadingHtml = `
    <div class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Generating AI-powered recommendations...</p>
    </div>
  `

  container.innerHTML = loadingHtml

  try {
    const response = await fetch(`/api/recommendations/${type}`)
    const data = await response.json()

    if (data.recommendations && data.recommendations.length > 0) {
      container.innerHTML = data.recommendations.map((item) => createRecommendationCard(item, type)).join("")

      // Update AI insights
      if (data.ai_insights) {
        displayAIInsights(data.ai_insights, type)
      }

      // Reinitialize tracking for new cards
      initializeTracking()
    } else {
      container.innerHTML = `<p>No ${type} recommendations available. Please update your profile for better results.</p>`
    }
  } catch (error) {
    console.error(`Error loading ${type}:`, error)
    container.innerHTML = `<p>Error loading ${type} recommendations. Please try again later.</p>`
  }
}

function createRecommendationCard(item, type) {
  const ratingHtml = item.rating
    ? `
    <div class="rating">
      <span class="stars">★★★★★</span>
      <span class="rating-value">${item.rating}</span>
    </div>
  `
    : ""

  const priceHtml = item.price
    ? `
    <span class="price"><i class="fas fa-tag"></i> ${item.price}</span>
  `
    : ""

  return `
    <div class="recommendation-card enhanced">
      <div class="card-header">
        <h3>${item.title}</h3>
        <div class="provider-rating">
          <span class="provider">${item.provider}</span>
          ${ratingHtml}
        </div>
      </div>
      <div class="card-content">
        <p>${item.description}</p>
        ${
          type === "courses"
            ? `
          <div class="card-meta">
            <span class="difficulty">Intermediate</span>
            <span class="duration"><i class="fas fa-clock"></i> 40 hours</span>
            ${priceHtml}
          </div>
        `
            : ""
        }
        ${
          type === "jobs"
            ? `
          <div class="job-meta">
            <div class="meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>Remote</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-briefcase"></i>
              <span>Mid-level</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-dollar-sign"></i>
              <span>$80,000 - $120,000</span>
            </div>
          </div>
        `
            : ""
        }
      </div>
      <div class="card-actions">
        <a href="${item.url}" target="_blank" class="btn btn-primary">
          <i class="fas fa-external-link-alt"></i>
          ${type === "jobs" ? "Apply Now" : type === "courses" ? "View Course" : "Learn More"}
        </a>
        <button class="btn btn-secondary track-btn" data-type="${type.slice(0, -1)}" data-id="${item.id}">
          <i class="fas fa-heart"></i>
          Save
        </button>
      </div>
    </div>
  `
}
