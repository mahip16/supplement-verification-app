import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase/FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

export default function FirebaseTestScreen() {
  const [message, setMessage] = useState("Testing Firebase...");

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Try creating a test user
        await createUserWithEmailAndPassword(
          FIREBASE_AUTH,
          "testuser@example.com",
          "Test1234"
        );
        console.log("Auth working! User created.");
        setMessage("Firebase Auth works ✅ (user created)");

      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          console.log("Auth working! User already exists.");
          setMessage("Firebase Auth works ✅ (user already exists)");
        } else {
          console.error("Auth test failed:", error.message);
          setMessage("Firebase Auth failed ❌\n" + error.message);
          return; // stop further testing if critical error
        }
      }

      // Try adding a test document to Firestore
      try {
        const docRef = await addDoc(collection(FIREBASE_DB, "testCollection"), {
          name: "Test User",
          timestamp: new Date(),
        });
        console.log("Firestore working! Document ID:", docRef.id);
        setMessage((prev) => prev + "\nFirestore works ✅");

      } catch (error) {
        console.error("Firestore test failed:", error.message);
        setMessage((prev) => prev + "\nFirestore failed ❌\n" + error.message);
      }
    };

    testFirebase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { textAlign: "center", fontSize: 18 }
});
