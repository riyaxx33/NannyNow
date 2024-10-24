import { logout } from '../public/backend/auth.js';

document.getElementById('logoutBtn').addEventListener('click', async () => {
  console.log("Logout button clicked"); // Add this line for debugging
  try {
    await logout();  // Call the logout function from auth.js
    console.log("User logged out successfully"); // Add this line for debugging
    window.location.href = 'index.html';  // Redirect to index.html after logout
  } catch (error) {
    console.error('Logout failed:', error);
  }
});
