import { login, redirectBasedOnRole } from "./auth";

// Reference to form and error message
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { user, role } = await login(email, password);
    redirectBasedOnRole(role);
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
