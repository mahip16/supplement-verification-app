// auth.js
import { FIREBASE_AUTH } from "./FirebaseConfig"; // your initialized auth
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

/**
 * Sign up a new user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} user object
 */
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Log in existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} user object
 */
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

/**
 * Log out current user
 */
export const logOut = async () => {
  try {
    await signOut(FIREBASE_AUTH);
  } catch (error) {
    throw error;
  }
};

/**
 * Validate password locally (custom rules)
 * @param {string} password 
 * @returns {object} validation results
 */
export const validatePassword = (password) => {
  const minLength = 6;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasLowerCase && hasUpperCase && hasNumber,
    containsLowercaseLetter: hasLowerCase,
    containsUppercaseLetter: hasUpperCase,
    containsNumber: hasNumber,
    minLength: password.length >= minLength
  };
};
