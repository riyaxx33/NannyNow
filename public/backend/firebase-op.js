import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  Timestamp, // Ensure you import Timestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import { db } from "./firebase-config.js";

const storage = getStorage();

// Redirect to parent homepage
export function redirectToParentHome() {
  window.location.href = "/parent_home.html";
}

export function redirectToNannyHome() {
  window.location.href = "/nanny_home.html";
}

// Get default profile picture URL based on gender
async function getDefaultProfilePicURL() {
  try {
    const defaultImageRef = ref(storage, `profile_pictures/default_avatar.jpg`);
    const url = await getDownloadURL(defaultImageRef);
    console.log("Default profile URL retrieved:", url);
    return url;
  } catch (error) {
    console.error("Error getting default profile picture:", error);
    return null;
  }
}

// Store parent data
export async function storeParentData(user, formData) {
  try {
    let profilePictureUrl = null;

    // Upload profile picture if provided
    if (formData.profilePicture instanceof File) {
      try {
        const fileName = `${user.uid}_${Date.now()}_${
          formData.profilePicture.name
        }`;
        const storageRef = ref(storage, `profile_pictures/${fileName}`);

        console.log("Uploading profile picture...");
        const snapshot = await uploadBytes(storageRef, formData.profilePicture);
        // console.log("Profile picture uploaded successfully");

        profilePictureUrl = await getDownloadURL(snapshot.ref);
        console.log(
          "Custom profile picture uploaded successfully:",
          profilePictureUrl
        );
      } catch (uploadError) {
        console.error("Error uploading custom profile picture:", uploadError);
        profilePictureUrl = null;
      }
    }

    // If no custom picture was provided or upload failed, use default picture
    if (!profilePictureUrl) {
      profilePictureUrl = await getDefaultProfilePicURL();
      console.log("Using default profile picture");
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
      phoneNumber: formData.phoneNumber,
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

// Store nanny data
export async function storeNannyData(user, formData) {
  try {
    let profilePictureUrl = null;

    // Upload profile picture if provided
    if (formData.profilePicture) {
      try {
        const fileName = `${user.uid}_${Date.now()}_${
          formData.profilePicture.name
        }`;
        const storageRef = ref(storage, `profile_pictures/${fileName}`);

        console.log("Uploading profile picture...");
        const snapshot = await uploadBytes(storageRef, formData.profilePicture);
        // console.log("Profile picture uploaded successfully");

        profilePictureUrl = await getDownloadURL(snapshot.ref);
        console.log(
          "Custom profile picture uploaded successfully:",
          profilePictureUrl
        );
      } catch (uploadError) {
        console.error("Error uploading custom profile picture:", uploadError);
        profilePictureUrl = null;
      }
    }

    // If no custom picture was provided or upload failed, use default picture
    if (!profilePictureUrl) {
      profilePictureUrl = await getDefaultProfilePicURL();
      console.log("Using default profile picture");
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

    // Store NANNY data
    await setDoc(doc(db, "NANNY", user.uid), {
      yrsExperience: formData.yrsExperience,
      description: formData.description,
    });

    console.log("Nanny data stored successfully");

    // Redirect to nanny_home.html after successful signup
    redirectToNannyHome();
  } catch (error) {
    console.error("Error storing nanny data:", error);
    throw error;
  }
}

// Handle file upload
export function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // File type validation - ensure that users only upload image files
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload an image file (JPEG, PNG, or GIF)");
      console.error("Invalid file type:", file.type);
      return null;
    }

    // File size validation - limit the size of uploaded files to prevent excessively large uploads
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File is too large. Please upload an image smaller than 5MB.");
      console.error("File too large:", file.size);
      return null;
    }
    console.log("File selected:", file.name);
    return file;
  }
  console.warn("No file selected");
  return null;
}

// Store post data
// Store post data
// Store post data
export async function storePostData(user, postData) {
  try {
    const postId = `${user.uid}_${Date.now()}`;

    // Convert payNegotiation string to boolean before storing
    const payNegotiationBool = postData.payNegotiation === 'true';

    await setDoc(doc(db, "POSTS", postId), {
      userId: user.uid,
      date: postData.date ? Timestamp.fromDate(new Date(postData.date)) : null,
      pay: postData.pay,
      payNegotiation: payNegotiationBool, // Store as boolean
      startTime: postData.startTime,
      endTime: postData.endTime,
      description: postData.description,
      createdAt: Timestamp.now(),
    });

    console.log("Post data stored successfully");
  } catch (error) {
    console.error("Error storing post data:", error);
    throw error;
  }
}

// Fetch posts for a specific user
export async function fetchPosts(userId) {
  try {
    const postsCollection = collection(db, "POSTS");
    const postSnapshot = await getDocs(postsCollection);

    const posts = postSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((post) => post.userId === userId); // Filter by userId

    console.log("User's posts fetched successfully:", posts);
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

// Update post data
export async function updatePostData(postId, updatedData) {
  try {
    const postRef = doc(db, "POSTS", postId);
    await setDoc(postRef, updatedData, { merge: true }); // Update specific fields only

    console.log("Post data updated successfully");
  } catch (error) {
    console.error("Error updating post data:", error);
    throw error;
  }
}

// Delete post data
export async function deletePostData(postId) {
  try {
    await deleteDoc(doc(db, "POSTS", postId));
    console.log("Post data deleted successfully");
  } catch (error) {
    console.error("Error deleting post data:", error);
    throw error;
  }
}