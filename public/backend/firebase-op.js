import {
  doc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  Timestamp,
  writeBatch,
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
    let profilePictureUrl = formData.profilePictureUrl;

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
    if (!profilePictureUrl && !formData.isEditMode) {
      profilePictureUrl = await getDefaultProfilePicURL();
      console.log("Using default profile picture");
    }

    // Store USER data
    await setDoc(
      doc(db, "USER", user.uid),
      {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        role: "parent",
        profilePictureUrl: profilePictureUrl,
        phoneNumber: formData.phoneNumber,
      },
      { merge: true }
    );

    // Store PARENT data
    await setDoc(
      doc(db, "PARENT", user.uid),
      {
        homeAddress: formData.homeAddress,
        children: formData.children,
        aboutMe: formData.aboutMe,
      },
      { merge: true }
    );

    console.log("Parent data stored successfully");

    // Only redirect to parent_home.html for new signups
    if (!formData.isEditMode) {
      redirectToParentHome();
    }
  } catch (error) {
    console.error("Error storing parent data:", error);
    throw error;
  }
}

export async function storeNannyData(user, formData) {
  try {
    let profilePictureUrl = formData.profilePictureUrl;

    // Handle profile picture upload
    if (formData.profilePicture instanceof File) {
      try {
        const fileName = `${user.uid}_${Date.now()}_${
          formData.profilePicture.name
        }`;
        const storageRef = ref(storage, `profile_pictures/${fileName}`);
        const snapshot = await uploadBytes(storageRef, formData.profilePicture);
        profilePictureUrl = await getDownloadURL(snapshot.ref);
      } catch (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        profilePictureUrl = null;
      }
    }

    // Use default picture only for new signups if no picture is provided
    if (!profilePictureUrl && !formData.isEditMode) {
      profilePictureUrl = await getDefaultProfilePicURL();
    }

    // Store USER data
    const userData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender,
      role: "nanny",
      phoneNumber: formData.phoneNumber,
    };

    // Only update profilePictureUrl if we have a new one
    if (profilePictureUrl) {
      userData.profilePictureUrl = profilePictureUrl;
    }

    await setDoc(doc(db, "USER", user.uid), userData, { merge: true });

    // Store NANNY data
    const nannyData = {
      yrsExperience: formData.yrsExperience,
      description: formData.description,
    };

    // Only set noJobs for new signups
    if (!formData.isEditMode) {
      nannyData.noJobs = 0;
    }

    await setDoc(doc(db, "NANNY", user.uid), nannyData, { merge: true });

    console.log("Nanny data stored successfully");

    if (!formData.isEditMode) {
      redirectToNannyHome();
    }
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

export async function storePostData(user, postData) {
  try {
    const shortUserId = user.uid.slice(-4);
    const timestamp = Date.now();
    const shortTimestamp = timestamp.toString().slice(-6);
    const jobId = `${shortUserId}_${shortTimestamp}`;

    const formattedDate = new Date(postData.date).toISOString().split("T")[0];
    const payNegotiationBool = postData.payNegotiation === "true";

    await setDoc(doc(db, "POSTS", jobId), {
      userId: user.uid,
      jobId: jobId,
      status: true,
      date: formattedDate,
      pay: postData.pay,
      payNegotiation: payNegotiationBool,
      startTime: postData.startTime,
      endTime: postData.endTime,
      description: postData.description,
      createdAt: Timestamp.now(),
      completed: false,
      interestedNannies: [],
      nanny_id: null, // Added this line to initialize nanny_id as null
    });

    console.log("Post data stored successfully with jobId:", jobId);
  } catch (error) {
    console.error("Error storing post data:", error);
    throw error;
  }
}

// Update the fetchPosts function to handle the new date format
export async function fetchPosts(userId) {
  try {
    const postsCollection = collection(db, "POSTS");
    const postSnapshot = await getDocs(postsCollection);

    const posts = postSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // No need to convert date as it's already in YYYY-MM-DD format
          formattedDate: data.date,
        };
      })
      .filter((post) => post.userId === userId);

    console.log("User's posts fetched successfully:", posts);
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

// Update the updatePostData function to handle the new date format
export async function updatePostData(postId, updatedData) {
  try {
    const postRef = doc(db, "POSTS", postId);

    // Format the date as YYYY-MM-DD if it exists in the updated data
    const dataToUpdate = {
      ...updatedData,
      date: updatedData.date
        ? new Date(updatedData.date).toISOString().split("T")[0]
        : undefined,
    };

    // Remove undefined fields to avoid errors
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    await updateDoc(postRef, dataToUpdate);
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

export async function updateExpiredPosts() {
  try {
    const postsCollection = collection(db, "POSTS");
    const postSnapshot = await getDocs(postsCollection);
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    const batch = writeBatch(db); // Use batch write for better performance
    let updateCount = 0;

    postSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Check if post date has passed and status is still true
      if (data.status && data.date < today) {
        const postRef = doc.ref;
        batch.update(postRef, { status: false });
        updateCount++;
      }
    });

    // Only commit the batch if there are updates to make
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Updated status for ${updateCount} expired posts`);
    }

    return updateCount;
  } catch (error) {
    console.error("Error updating expired posts:", error);
    throw error;
  }
}
