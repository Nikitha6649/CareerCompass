// Job Helper JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const jobForm = document.getElementById("jobForm")
  const resultsSection = document.getElementById("resultsSection")
  const companyResults = document.getElementById("companyResults")

  jobForm.addEventListener("submit", handleJobSearch)
})

async function handleJobSearch(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const jobTitle = formData.get("job_title")
  const location = formData.get("location")

  // Validate form
  if (!window.validateForm(event.target)) {
    return
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  window.setLoading(submitButton, true)

  try {
    const response = await window.apiRequest("/api/find-companies", {
      method: "POST",
      body: JSON.stringify({
        job_title: jobTitle,
        location: location,
      }),
    })

    if (response.success) {
      displayCompanyResults(response.data.data)
      document.getElementById("resultsSection").style.display = "block"
      document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" })
    } else {
      window.showNotification("Error finding companies: " + response.data.error, "error")
    }
  } catch (error) {
    window.showNotification("An error occurred. Please try again.", "error")
  } finally {
    window.setLoading(submitButton, false)
  }
}

function displayCompanyResults(aiResponse) {
  const resultsContainer = document.getElementById("companyResults")
  const parsedData = window.parseAIResponse(aiResponse)

  if (parsedData.error) {
    resultsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to parse AI recommendations. Please try again.</p>
            </div>
        `
    return
  }

  const companies = parsedData.companies || []

  if (companies.length === 0) {
    resultsContainer.innerHTML = `
            <div class="empty-results">
                <p>No companies found matching your criteria. Please try different selections.</p>
            </div>
        `
    return
  }

  resultsContainer.innerHTML = companies
    .map(
      (company) => `
        <div class="result-card">
            <h3>${company.name}</h3>
            <div class="provider">${company.industry}</div>
            <div class="description">${company.description}</div>
            <div class="details">
                <span class="detail-item">Size: ${company.company_size}</span>
                <span class="detail-item">Industry: ${company.industry}</span>
            </div>
            <div class="why-relevant">
                <strong>Why relevant:</strong> ${company.why_relevant}
            </div>
            <div class="actions">
                <a href="https://www.google.com/search?q=${encodeURIComponent(company.search_query)}" 
                   target="_blank" class="btn btn-primary btn-small">
                    <i class="fas fa-search"></i>
                    Search Jobs
                </a>
                <button class="btn btn-secondary btn-small save-btn" 
                        data-type="job" 
                        data-item='${JSON.stringify(company).replace(/'/g, "&apos;")}'>
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}
