function createUserProfile(userId, gender) {
    let profilePicUrl;

    // Assign the common profile picture based on gender
    if (gender === "female") {
        // If using local files:
        profilePicUrl = "path/to/female_profile_pic.jpg";

        // If using Firebase Cloud Storage:
        // profilePicUrl = "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID/o/profile_pictures%2Ffemale_profile_pic.jpg?alt=media";

    } else if (gender === "male") {
        // If using local files:
        profilePicUrl = "path/to/male_profile_pic.jpg";

        // If using Firebase Cloud Storage:
        // profilePicUrl = "https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID/o/profile_pictures%2Fmale_profile_pic.jpg?alt=media";
    }

    // Save user profile to Firestore
    firestore.collection("users").doc(userId).set({
        profilePicUrl: profilePicUrl,
        gender: gender,
        // other user fields...
    });
}
