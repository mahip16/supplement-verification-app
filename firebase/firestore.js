// firebase/firestore.js
import { FIREBASE_APP } from './FirebaseConfig';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore(FIREBASE_APP);

export const fetchSupplements = async () => {
  const querySnapshot = await getDocs(collection(db, "supplements"));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};
