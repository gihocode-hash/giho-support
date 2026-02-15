// Firebase Client Configuration (Frontend)
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDiX1FlDP-FAhRwc6mFoqkfChGhohUBeWA",
  authDomain: "giho-support.firebaseapp.com",
  projectId: "giho-support",
  storageBucket: "giho-support.firebasestorage.app",
  messagingSenderId: "979326163431",
  appId: "1:979326163431:web:99c26110e87b1b2ec78542"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export { storage }
