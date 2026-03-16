import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { StagedItem } from '../types';

export const useFirestoreSync = (user: any) => {
  const [items, setItems] = useState<StagedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const uid = user.uid;
    // We'll store projects in users/{uid}/items
    const itemsQuery = query(
      collection(db, `users/${uid}/items`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as StagedItem[];
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveItem = async (item: StagedItem) => {
    if (!user) return;
    const itemRef = doc(db, `users/${user.uid}/items/${item.id}`);
    const data = {
      ...item,
      updatedAt: Timestamp.now(),
      createdAt: (item as any).createdAt || Timestamp.now()
    };
    await setDoc(itemRef, data, { merge: true });
  };

  const deleteItem = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/items/${id}`));
  };

  const syncAllItems = async (itemsList: StagedItem[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    itemsList.forEach(item => {
      const ref = doc(db, `users/${user.uid}/items/${item.id}`);
      batch.set(ref, { 
        ...item, 
        updatedAt: Timestamp.now(),
        createdAt: (item as any).createdAt || Timestamp.now()
      }, { merge: true });
    });
    await batch.commit();
  };

  return {
    items,
    setItems,
    loading,
    saveItem,
    deleteItem,
    syncAllItems
  };
};