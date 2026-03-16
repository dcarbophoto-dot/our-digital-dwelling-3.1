
// Fix: Import standard Firebase storage functions for modular SDK (v9+)
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a base64 encoded image to Firebase Storage.
 * Path: user_uploads/{uid}/{timestamp}_{fileName}
 */
export const uploadBase64ToStorage = async (uid: string, base64: string, fileName: string, projectFolder?: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const sanitizedFolder = projectFolder ? projectFolder.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'default_project';
    const path = `user_uploads/${uid}/${sanitizedFolder}/${timestamp}_${sanitizedFileName}`;
    
    const fileRef = ref(storage, path);
    
    // uploadString handles the 'data:image/png;base64,' prefix automatically if data_url is specified
    await uploadString(fileRef, base64, 'data_url');
    // Correct usage of modular getDownloadURL function
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error);
    throw error;
  }
};

export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Could not delete image from Firebase Storage:", error);
  }
};
