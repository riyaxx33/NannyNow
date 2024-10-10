import { auth, db } from "firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Reference to form and error message
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");
