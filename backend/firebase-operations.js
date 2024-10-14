import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

export async function storeParentData(user, formData) {
  try {
    // Store USER data
    await setDoc(doc(db, "USER", user.uid), {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      gender: formData.gender,
      role: "parent",
    });

    // Store PARENT data
    await setDoc(doc(db, "PARENT", user.uid), {
      homeAddress: formData.homeAddress,
      children: formData.children,
    });

    console.log("Parent data stored successfully");
  } catch (error) {
    console.log("Error storing parent data:", error);
    throw error;
  }
}
