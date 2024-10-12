import { auth, db } from "firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Reference to form and error message
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Sign in user with Firebase authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check the user's role in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Redirect based on user role
      if (userData.role === "nanny") {
        window.location.href = "nanny_home.html";
      } else if (userData.role === "parent") {
        window.location.href = "parent_home.html";
      }
    } else {
      errorMsg.textContent =
        "No account found. Please check if your email and password is correct.";
    }
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
