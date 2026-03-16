
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot, runTransaction, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";
import { deleteFileFromStorage } from "./storageService";

const USERS_COLLECTION = "users";

export interface UserProfile {
  name: string;
  email: string;
  photoFileName: string;
  createdAt: number;
  credits: number;
  plan: string;
}

export interface FileRecord {
  id: string;
  projectId?: string;
  fileName: string;
  originalUrl: string;
  stagedUrl?: string;
  style?: string;
  roomType?: string;
  prompt?: string;
  timestamp: any;
}

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: any;
  updatedAt?: any;
  thumbnailUrl?: string;
}

const CREDIT_MAP: Record<string, { credits: number, plan?: string }> = {
  // Subscriptions
  'price_1T1OzEIY2wu1OpEHADGXvsXV': { credits: 20, plan: 'Basic' },
  'price_1T1OzVIY2wu1OpEHvMGvtAmL': { credits: 45, plan: 'Standard' },
  'price_1T1OzcIY2wu1OpEHcjoWtrdt': { credits: 100, plan: 'Premium' },
  // Payments (Top-up)
  'price_1T2dYXIY2wu1OpEHx43rE2WD': { credits: 25, plan: 'Pay as You Go' },
  'price_1T2dYdIY2wu1OpEHxhSwJWYO': { credits: 50, plan: 'Pay as You Go' },
  'price_1T2dYiIY2wu1OpEHxCsp12Cx': { credits: 100, plan: 'Pay as You Go' }
};

/**
 * Ensures a user document exists in Firestore. 
 */
export const ensureUserProfile = async (uid: string, email: string | null, displayName: string | null): Promise<UserProfile> => {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    const data: UserProfile = {
      name: displayName || email?.split('@')[0] || "User",
      email: email || "",
      photoFileName: "",
      createdAt: Date.now(),
      credits: 10, // Default for free plan
      plan: "free"
    };
    await setDoc(docRef, data);
    return data;
  } else {
    const existingData = docSnap.data();
    if (existingData.plan === undefined || existingData.credits === undefined) {
      const updates: Partial<UserProfile> = {};
      if (existingData.plan === undefined) updates.plan = "free";
      if (existingData.credits === undefined) updates.credits = 10;
      await updateDoc(docRef, updates);
      return { ...existingData, ...updates } as UserProfile;
    }
  }
  return docSnap.data() as UserProfile;
};

export const createProject = async (uid: string, name: string): Promise<string> => {
  const projectsRef = collection(db, USERS_COLLECTION, uid, "projects");
  const docRef = await addDoc(projectsRef, {
    name,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUserProjects = async (uid: string): Promise<ProjectRecord[]> => {
  const projectsRef = collection(db, USERS_COLLECTION, uid, "projects");
  const q = query(projectsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRecord));
};

export const deleteProject = async (uid: string, projectId: string): Promise<boolean> => {
  try {
    const filesCollectionRef = collection(db, USERS_COLLECTION, uid, "files");
    const q = query(filesCollectionRef, where("projectId", "==", projectId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data() as FileRecord;
      if (fileData.originalUrl) {
         await deleteFileFromStorage(fileData.originalUrl);
      }
      if (fileData.stagedUrl) {
         await deleteFileFromStorage(fileData.stagedUrl);
      }
      await deleteDoc(fileDoc.ref);
    });
    
    await Promise.all(deletePromises);

    const projectRef = doc(db, USERS_COLLECTION, uid, "projects", projectId);
    await deleteDoc(projectRef);

    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
};

/**
 * Creates a Stripe checkout session via the firestore-stripe-payments extension logic.
 */
export const createStripeCheckout = async (uid: string, priceId: string, mode: 'payment' | 'subscription' = 'subscription'): Promise<string> => {
  const checkoutSessionsRef = collection(db, "customers", uid, "checkout_sessions");
  
  const payload = {
    price: priceId,
    mode: mode,
    success_url: "https://ourdigitaldwelling.com/?payment_status=success",
    cancel_url: "https://ourdigitaldwelling.com/?payment_status=failure",
    clientReferenceId: uid,
  };

  const docRef = await addDoc(checkoutSessionsRef, payload);

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const data = snap.data();
      if (data?.url) {
        unsubscribe();
        resolve(data.url);
      } else if (data?.error) {
        unsubscribe();
        reject(new Error(data.error.message));
      }
    });
    setTimeout(() => {
      unsubscribe();
      reject(new Error("Timeout waiting for Stripe session to be generated by the extension."));
    }, 20000);
  });
};

/**
 * Calls the Stripe Extension callable function to create a portal link.
 */
export const createPortalLink = async (): Promise<string> => {
  console.log("createPortalLink Service: Process started.");
  const functionName = 'ext-firestore-stripe-payments-createPortalLink';
  console.log(`createPortalLink Service: Using callable function '${functionName}'`);
  
  const createPortalLinkFn = httpsCallable(functions, functionName);
  
  const returnUrl = "https://ourdigitaldwelling.com/";
  console.log(`createPortalLink Service: Calling function with returnUrl parameter: "${returnUrl}"`);

  try {
    const { data }: any = await createPortalLinkFn({
      returnUrl: returnUrl
    });
    
    console.log("createPortalLink Service: Function execution successful. Data received:", data);
    
    if (data && data.url) {
      console.log(`createPortalLink Service: Portal URL extracted: ${data.url}`);
      return data.url;
    } else {
      console.error("createPortalLink Service: Response did not contain 'url' property", data);
      throw new Error("Failed to retrieve portal URL.");
    }
  } catch (error) {
    console.error("createPortalLink Service: Error during execution:", error);
    throw error;
  }
};

/**
 * Establishes a listener to sync Stripe data from /customers to /users
 */
export const setupStripeSync = (uid: string, onUpdate: (profile: UserProfile) => void) => {
  const unsubscribes: (() => void)[] = [];

  const handleSync = async (type: 'subscriptions' | 'payments', stripeDocId: string, stripeData: any) => {
    const userDocPath = type === 'subscriptions' ? `subscriptions` : `payment`;
    const userSyncRef = doc(db, USERS_COLLECTION, uid, userDocPath, stripeDocId);
    
    // Check if already synced
    const syncSnap = await getDoc(userSyncRef);
    if (syncSnap.exists()) return;

    // Determine credits to award
    let priceId = "";
    if (type === 'subscriptions') {
      priceId = stripeData.items?.[0]?.price?.id || stripeData.price?.id;
    } else {
      priceId = stripeData.items?.[0]?.price?.id || stripeData.price?.id;
    }

    if (!priceId || !CREDIT_MAP[priceId]) return;

    const award = CREDIT_MAP[priceId];

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) return;

        const currentData = userSnap.data() as UserProfile;
        const newCredits = (currentData.credits || 0) + award.credits;
        const updates: any = { credits: newCredits };
        
        if (award.plan) {
          updates.plan = award.plan;
        }

        transaction.update(userRef, updates);
        transaction.set(userSyncRef, {
          ...stripeData,
          syncedAt: serverTimestamp(),
          awardedCredits: award.credits
        });
      });

      // Fetch updated profile to trigger UI update
      const updatedProfile = await getUserProfile(uid);
      if (updatedProfile) onUpdate(updatedProfile);

    } catch (error) {
      console.error(`Error syncing Stripe ${type}:`, error);
    }
  };

  // 1. Check if user exists in /customers
  const customerRef = doc(db, "customers", uid);
  getDoc(customerRef).then((snap) => {
    if (!snap.exists()) return;

    // 2. Setup listeners for subscriptions
    const subsRef = collection(db, "customers", uid, "subscriptions");
    unsubscribes.push(onSnapshot(subsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          if (data.status === 'active' || data.status === 'trialing') {
            handleSync('subscriptions', change.doc.id, data);
          }
        }
      });
    }));

    // 3. Setup listeners for payments
    const paymentsRef = collection(db, "customers", uid, "payments");
    unsubscribes.push(onSnapshot(paymentsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.status === 'succeeded') {
            handleSync('payments', change.doc.id, data);
          }
        }
      });
    }));
  });

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as UserProfile;
    return null;
  } catch (error) {
    return null;
  }
};

export const deductCredit = async (uid: string, amount: number = 1): Promise<number | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCredits = docSnap.data().credits ?? 0;
      const newCredits = Math.max(0, currentCredits - amount);
      await updateDoc(docRef, { credits: newCredits });
      return newCredits;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const docRef = db ? doc(db, USERS_COLLECTION, uid) : null;
    if (docRef) await updateDoc(docRef, data);
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    return false;
  }
};

export const saveFileRecord = async (uid: string, fileData: {
  projectId?: string;
  fileName: string;
  originalUrl: string;
  stagedUrl?: string;
  style?: string;
  roomType?: string;
  prompt?: string;
}) => {
  try {
    const filesCollectionRef = collection(db, USERS_COLLECTION, uid, "files");
    
    // Clean data of undefined values as Firestore does not support them
    const data: any = {
      ...fileData,
      timestamp: serverTimestamp()
    };
    
    // Safely remove any undefined keys
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    await addDoc(filesCollectionRef, data);

    if (fileData.projectId) {
      const projectRef = doc(db, USERS_COLLECTION, uid, "projects", fileData.projectId);
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      // Use stagedUrl if available, otherwise fallback to the uploaded originalUrl
      if (fileData.stagedUrl) {
        updateData.thumbnailUrl = fileData.stagedUrl;
      } else if (fileData.originalUrl) {
        // Also ensure a project gets a thumbnail when a new file is uploaded
        // Check if the project already has a thumbnail by fetching it first? 
        // We'll just overwrite it for now since the newest photo is a good thumbnail.
        updateData.thumbnailUrl = fileData.originalUrl;
      }
      await updateDoc(projectRef, updateData);
    }
  } catch (error) {
    console.error("Error saving file record:", error);
  }
};

export const getUserFiles = async (uid: string): Promise<FileRecord[]> => {
  try {
    const filesCollectionRef = collection(db, USERS_COLLECTION, uid, "files");
    const q = query(filesCollectionRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as FileRecord));
  } catch (error) {
    return [];
  }
};
