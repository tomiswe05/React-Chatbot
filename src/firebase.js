import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC36uKOL0TMbQNl6O6o3NLFabFdicB08sY",
  authDomain: "react-ragdocs.firebaseapp.com",
  projectId: "react-ragdocs",
  storageBucket: "react-ragdocs.firebasestorage.app",
  messagingSenderId: "69565581010",
  appId: "1:69565581010:web:e70456aa99c5f3d5b68f0b"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
