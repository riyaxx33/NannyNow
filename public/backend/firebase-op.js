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

// redirect to parent homepage
export function redirectToParentHome() {
  window.location.href = "/parent_home2.html";
}

export function redirectToNannyHome() {
  window.location.href = "/nanny_home.html";
}


// STORE PARENT DATA
export async function storeParentData(user, formData) {
  try {
    let profilePictureUrl = null;

    // Upload profile picture if provided
    if (formData.profilePicture) {
      const fileName = `${user.uid}_${Date.now()}_${
        formData.profilePicture.name
      }`;
      const storageRef = ref(storage, `profile_pictures/${fileName}`);

      console.log("Uploading profile picture...");
      const snapshot = await uploadBytes(storageRef, formData.profilePicture);
      console.log("Profile picture uploaded successfully");

      profilePictureUrl = await getDownloadURL(snapshot.ref);
      console.log("Profile picture URL:", profilePictureUrl);
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
      aboutMe: formData.aboutMe,
    });

    console.log("Parent data stored successfully");

    // Redirect to parent_home.html after successful signup
    redirectToParentHome();
  } catch (error) {
    console.error("Error storing parent data:", error);
    throw error;
  }
}

export async function storeNannyData(user, formData) {
  try {
    let profilePictureUrl = null;

    // Upload profile picture if provided
    if (formData.profilePicture) {
      const fileName = `${user.uid}_${Date.now()}_${
        formData.profilePicture.name
      }`;
      const storageRef = ref(storage, `profile_pictures/${fileName}`);

      console.log("Uploading profile picture...");
      const snapshot = await uploadBytes(storageRef, formData.profilePicture);
      console.log("Profile picture uploaded successfully");

      profilePictureUrl = await getDownloadURL(snapshot.ref);
      console.log("Profile picture URL:", profilePictureUrl);
    }

    // Store USER data
    await setDoc(doc(db, "USER", user.uid), {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender,
      role: "nanny",
      profilePictureUrl: profilePictureUrl,
    });
    // Store Nanny data
    await setDoc(doc(db, "NANNY", user.uid), {
      yrsExperience:formData.yrsExperience,
      description:formData.description
    });

    console.log("Nanny data stored successfully");

    // Redirect to nanny_home.html after successful signup
    redirectToNannyHome();
  } catch (error) {
    console.error("Error storing Nanny data:", error);
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
    console.log("File selected:", file.name);
    return file;
  }
  return null;
}



export async function storePostData(user, postData) {
  try {
    // Create a unique ID for the post using the user's UID and the current timestamp
    const postId = `${user.uid}_${Date.now()}`;

    // Store POST data in the Firestore "POSTS" collection
    await setDoc(doc(db, "POSTS", postId), {
      userId: user.uid, // Store the user's UID
      date: postData.date, // Store the date
      pay: postData.pay, // Store the pay per hour
      description: postData.description, // Store the job description
      createdAt: new Date().toISOString(), // Optional: Store the timestamp of when the post was created
    });

    console.log("Post data stored successfully");

    // Optionally redirect or perform other actions after storing
    // redirectToPostPage(); // Uncomment and define this function as needed

  } catch (error) {
    console.error("Error storing post data:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

