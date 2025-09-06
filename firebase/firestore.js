// firebase/firestore.js
import app from './FirebaseConfig';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore(app);

export const fetchSupplements = async () => {
  const querySnapshot = await getDocs(collection(db, "supplements"));
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
};
