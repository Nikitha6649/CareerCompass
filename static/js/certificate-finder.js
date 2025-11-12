// Certificate Finder JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const certificateForm = document.getElementById("certificateForm")
  const resultsSection = document.getElementById("resultsSection")
  const certificateResults = document.getElementById("certificateResults")

  certificateForm.addEventListener("submit", handleCertificateSearch)
})

async function handleCertificateSearch(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const interests = formData.getAll("interests")
  const goals = formData.getAll("goals")
  const coursePreference = formData.get("course_preference")

  // Validate form
  if (!window.validateForm(event.target)) {
    return
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  window.setLoading(submitButton, true)

  try {
    const response = await window.apiRequest("/api/find-certificates", {
      method: "POST",
      body: JSON.stringify({
        interests,
        goals,
        course_preference: coursePreference,
      }),
    })

    if (response.success) {
      displayCertificateResults(response.data.data)
      document.getElementById("resultsSection").style.display = "block"
      document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" })
    } else {
      window.showNotification("Error finding certificates: " + response.data.error, "error")
    }
  } catch (error) {
    window.showNotification("An error occurred. Please try again.", "error")
  } finally {
    window.setLoading(submitButton, false)
  }
}

function displayCertificateResults(aiResponse) {
  const resultsContainer = document.getElementById("certificateResults")
  const parsedData = window.parseAIResponse(aiResponse)

  if (parsedData.error) {
    resultsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to parse AI recommendations. Please try again.</p>
            </div>
        `
    return
  }

  const certificates = parsedData.certificates || []

  if (certificates.length === 0) {
    resultsContainer.innerHTML = `
            <div class="empty-results">
                <p>No certificates found matching your criteria. Please try different selections.</p>
            </div>
        `
    return
  }

  resultsContainer.innerHTML = certificates
    .map(
      (cert) => `
        <div class="result-card">
            <h3>${cert.name}</h3>
            <div class="provider">${cert.provider}</div>
            <div class="score">Relevance: ${cert.relevance_score}%</div>
            <div class="description">${cert.description}</div>
            <div class="details">
                <span class="detail-item">Cost: ${cert.cost}</span>
                <span class="detail-item">Duration: ${cert.duration}</span>
            </div>
            <div class="skills">
                ${cert.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
            </div>
            <div class="actions">
                <a href="${cert.url}" target="_blank" class="btn btn-primary btn-small">
                    <i class="fas fa-external-link-alt"></i>
                    View Certificate
                </a>
                <button class="btn btn-secondary btn-small save-btn" 
                        data-type="certificate" 
                        data-item='${JSON.stringify(cert).replace(/'/g, "&apos;")}'>
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}
