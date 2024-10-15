import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import { db } from "./firebase-config.js";

const storage = getStorage();

export async function storeParentData(user, formData) {
  try {
    let profilePictureUrl = null;

    // Upload profile picture if provided
    if (formData.profilePicture) {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, formData.profilePicture);
      profilePictureUrl = await getDownloadURL(snapshot.ref);
    }

    // Store USER data
    await setDoc(doc(db, "USER", user.uid), {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender,
      role: "parent",
      profilePictureUrl: profilePictureUrl,
    });

    // Store PARENT data
    await setDoc(doc(db, "PARENT", user.uid), {
      homeAddress: formData.homeAddress,
      children: formData.children,
    });

    console.log("Parent data stored successfully");

    // Redirect to parent_home.html after successful signup
    redirectToParentHome();
  } catch (error) {
    console.log("Error storing parent data:", error);
    throw error;
  }
}

export function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // File type validation - ensure that users only upload image files
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (JPEG, PNG, or GIF)");
      return null;
    }

    // File size validation - limit the size of uploaded files to prevent excessively large uploads
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File is too large. Please upload an image smaller than 5MB.");
      return null;
    }

    return file;
  }
  return null;
}

function redirectToParentHome() {
  window.location.href = "../public/parent_home.html";
}
