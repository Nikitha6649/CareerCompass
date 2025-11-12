// Course Suggester JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const courseForm = document.getElementById("courseForm")
  const resultsSection = document.getElementById("resultsSection")
  const courseResults = document.getElementById("courseResults")

  courseForm.addEventListener("submit", handleCourseSearch)
})

async function handleCourseSearch(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const learningPreferences = formData.getAll("learning_preferences")
  const educationalBackground = formData.getAll("educational_background")
  const careerAspirations = formData.getAll("career_aspirations")

  // Validate form
  if (!window.validateForm(event.target)) {
    return
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  window.setLoading(submitButton, true)

  try {
    const response = await window.apiRequest("/api/suggest-courses", {
      method: "POST",
      body: JSON.stringify({
        learning_preferences: learningPreferences,
        educational_background: educationalBackground,
        career_aspirations: careerAspirations,
      }),
    })

    if (response.success) {
      displayCourseResults(response.data.data)
      document.getElementById("resultsSection").style.display = "block"
      document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" })
    } else {
      window.showNotification("Error suggesting courses: " + response.data.error, "error")
    }
  } catch (error) {
    window.showNotification("An error occurred. Please try again.", "error")
  } finally {
    window.setLoading(submitButton, false)
  }
}

function displayCourseResults(aiResponse) {
  const resultsContainer = document.getElementById("courseResults")
  const parsedData = window.parseAIResponse(aiResponse)

  if (parsedData.error) {
    resultsContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to parse AI recommendations. Please try again.</p>
            </div>
        `
    return
  }

  const courses = parsedData.courses || []

  if (courses.length === 0) {
    resultsContainer.innerHTML = `
            <div class="empty-results">
                <p>No courses found matching your criteria. Please try different selections.</p>
            </div>
        `
    return
  }

  resultsContainer.innerHTML = courses
    .map(
      (course) => `
        <div class="result-card">
            <h3>${course.title}</h3>
            <div class="provider">${course.provider}</div>
            <div class="score">Relevance: ${course.relevance_score}%</div>
            <div class="description">${course.description}</div>
            <div class="details">
                <span class="detail-item">Level: ${course.difficulty}</span>
                <span class="detail-item">Duration: ${course.duration}</span>
                <span class="detail-item">Price: ${course.price}</span>
            </div>
            <div class="skills">
                ${course.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
            </div>
            <div class="actions">
                <a href="${course.url}" target="_blank" class="btn btn-primary btn-small">
                    <i class="fas fa-external-link-alt"></i>
                    View Course
                </a>
                <button class="btn btn-secondary btn-small save-btn" 
                        data-type="course" 
                        data-item='${JSON.stringify(course).replace(/'/g, "&apos;")}'>
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}
