// Firebase Authentication
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

let currentUser = null

// DOM Elements
const authModal = document.getElementById("authModal")
const loginBtn = document.getElementById("loginBtn")
const logoutBtn = document.getElementById("logoutBtn")
const closeModal = document.querySelector(".close")
const authTabs = document.querySelectorAll(".auth-tab")
const authForms = document.querySelectorAll(".auth-form")

// Auth form elements
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const loginSubmit = document.getElementById("loginSubmit")
const registerSubmit = document.getElementById("registerSubmit")

// Initialize auth state listener
onAuthStateChanged(window.auth, (user) => {
  currentUser = user
  updateAuthUI(user)
})

function updateAuthUI(user) {
  if (user) {
    loginBtn.style.display = "none"
    logoutBtn.style.display = "block"
    console.log("User logged in:", user.email)
  } else {
    loginBtn.style.display = "block"
    logoutBtn.style.display = "none"
    console.log("User logged out")
  }
}

// Event Listeners
loginBtn.addEventListener("click", () => {
  authModal.style.display = "block"
})

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(window.auth)
    authModal.style.display = "none"
  } catch (error) {
    console.error("Logout error:", error)
  }
})

closeModal.addEventListener("click", () => {
  authModal.style.display = "none"
})

window.addEventListener("click", (event) => {
  if (event.target === authModal) {
    authModal.style.display = "none"
  }
})

// Auth tabs
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.getAttribute("data-tab")

    // Update active tab
    authTabs.forEach((t) => t.classList.remove("active"))
    tab.classList.add("active")

    // Update active form
    authForms.forEach((form) => form.classList.remove("active"))
    document.getElementById(`${targetTab}Form`).classList.add("active")
  })
})

// Login form
loginSubmit.addEventListener("click", async (e) => {
  e.preventDefault()
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  if (!email || !password) {
    alert("Please fill in all fields")
    return
  }

  try {
    loginSubmit.textContent = "Logging in..."
    loginSubmit.disabled = true

    await signInWithEmailAndPassword(window.auth, email, password)
    authModal.style.display = "none"

    // Clear form
    document.getElementById("loginEmail").value = ""
    document.getElementById("loginPassword").value = ""
  } catch (error) {
    console.error("Login error:", error)
    alert("Login failed: " + error.message)
  } finally {
    loginSubmit.textContent = "Login"
    loginSubmit.disabled = false
  }
})

// Register form
registerSubmit.addEventListener("click", async (e) => {
  e.preventDefault()
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value

  if (!email || !password) {
    alert("Please fill in all fields")
    return
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters")
    return
  }

  try {
    registerSubmit.textContent = "Creating account..."
    registerSubmit.disabled = true

    const userCredential = await createUserWithEmailAndPassword(window.auth, email, password)

    // Create user profile in Firestore
    await setDoc(doc(window.db, "users", userCredential.user.uid), {
      email: email,
      createdAt: new Date(),
      profile: {
        fullName: "",
        education: "",
        skills: "",
        aspirations: "",
      },
    })

    authModal.style.display = "none"

    // Clear form
    document.getElementById("registerEmail").value = ""
    document.getElementById("registerPassword").value = ""
  } catch (error) {
    console.error("Registration error:", error)
    alert("Registration failed: " + error.message)
  } finally {
    registerSubmit.textContent = "Register"
    registerSubmit.disabled = false
  }
})

// Firestore helper functions
window.saveToFirestore = async (collection, data) => {
  if (!currentUser) {
    alert("Please login to save items")
    return false
  }

  try {
    await addDoc(collection(window.db, collection), {
      ...data,
      userId: currentUser.uid,
      savedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error("Save error:", error)
    return false
  }
}

window.getUserSavedItems = async (collectionName) => {
  if (!currentUser) return []

  try {
    const q = query(collection(window.db, collectionName), where("userId", "==", currentUser.uid))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Get saved items error:", error)
    return []
  }
}

window.deleteFromFirestore = async (collectionName, docId) => {
  if (!currentUser) return false

  try {
    await deleteDoc(doc(window.db, collectionName, docId))
    return true
  } catch (error) {
    console.error("Delete error:", error)
    return false
  }
}

window.saveUserProfile = async (profileData) => {
  if (!currentUser) {
    alert("Please login to save profile")
    return false
  }

  try {
    await setDoc(
      doc(window.db, "users", currentUser.uid),
      {
        profile: profileData,
        updatedAt: new Date(),
      },
      { merge: true },
    )
    return true
  } catch (error) {
    console.error("Save profile error:", error)
    return false
  }
}

window.getUserProfile = async () => {
  if (!currentUser) return null

  try {
    const docRef = doc(window.db, "users", currentUser.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data().profile || {}
    }
    return {}
  } catch (error) {
    console.error("Get profile error:", error)
    return {}
  }
}

// Export current user for other scripts
window.getCurrentUser = () => currentUser
