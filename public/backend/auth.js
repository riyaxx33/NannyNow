import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/*  Initialise authenthication state listener
    callback function will be called whenever the authentication state changes */
export function initAuth(onAuthStateChangedCallback) {
  return onAuthStateChanged(auth, onAuthStateChangedCallback);
}

/* Login function */
export async function login(email, password) {
  // Calls signInWithEmailAndPassword to authenticate the user
  // If successful, retrieves the user's document from Firestore using their unique user ID
  // If the user document doesn't exist, an error is thrown
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check the user's role in Firestore - NANNY or PARENT
    const userDoc = await getDoc(doc(db, "USER", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { user, role: userData.role };
    } else {
      throw new Error(
        "No account found. Please check if your email and password are correct."
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

/* Logout function */
/* Logout function */
export async function logout() {
  try {
    await firebaseSignOut(auth);
    window.location.href = 'index.html'; // Add the redirect here
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function getUserRole(userId) {
  try {
    const userDoc = await getDoc(doc(db, "USER", userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    } else {
      throw new Error("user document not found");
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    throw error;
  }
}

export function redirectBasedOnRole(role) {
  if (role === "nanny") {
    window.location.href = "nanny_home.html";
  } else if (role === "parent") {
    window.location.href = "parent_home.html";
  } else {
    throw new Error("Invalid user role");
  }
}
