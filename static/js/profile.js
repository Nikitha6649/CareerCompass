// Profile JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm")

  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSave)
  }

  // Load existing profile data
  loadProfileData()
})

async function loadProfileData() {
  try {
    // Profile data is already loaded from the server template
    console.log("✅ Profile data loaded from server")
  } catch (error) {
    console.error("Error loading profile:", error)
    window.showNotification("Error loading profile data", "error")
  }
}

async function handleProfileSave(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const profileData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    education: formData.get("education"),
    skills: formData.get("skills"),
    aspirations: formData.get("aspirations"),
  }

  const submitButton = event.target.querySelector('button[type="submit"]')
  window.setLoading(submitButton, true)

  try {
    const response = await fetch("/api/save-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })

    const result = await response.json()

    if (result.success) {
      window.showNotification("Profile saved successfully!", "success")
    } else {
      window.showNotification(result.message || "Failed to save profile", "error")
    }
  } catch (error) {
    console.error("Profile save error:", error)
    window.showNotification("An error occurred. Please try again.", "error")
  } finally {
    window.setLoading(submitButton, false)
  }
}
