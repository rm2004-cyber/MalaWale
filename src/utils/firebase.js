import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyB0A3ssUdt0D85ZFhXRaA36Y19iZhi4yhw",
//   authDomain: "malawale-832bf.firebaseapp.com",
//   projectId: "malawale-832bf",
//   storageBucket: "malawale-832bf.firebasestorage.app",
//   messagingSenderId: "1002469623815",
//   appId: "1:1002469623815:web:88df357e69a383093a42a2"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCEsWv7rSPC2ccq5-hadFWG3KJ5FliwHpY",
  authDomain: "malawale-web.firebaseapp.com",
  projectId: "malawale-web",
  storageBucket: "malawale-web.firebasestorage.app",
  messagingSenderId: "597469907212",
  appId: "1:597469907212:web:6ab3e062ca7fbafa9ae129"
}; 

//formy

// const firebaseConfig = {
//   apiKey: "AIzaSyDWjSTG2T10ybWyGzxt7aMtAqu7E0a8u3U",
//   authDomain: "malawaleweb.firebaseapp.com",
//   projectId: "malawaleweb",
//   storageBucket: "malawaleweb.firebasestorage.app",
//   messagingSenderId: "688094750369",
//   appId: "1:688094750369:web:2a9ab12abb56171c0ff2e0"
// };rahul
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber, signOut };