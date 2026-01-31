import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAAO8Q3H1g6Rhn595rK4c8XFk6e9e5oQi0",
  authDomain: "rehasport-trainer.firebaseapp.com",
  projectId: "rehasport-trainer",
  storageBucket: "rehasport-trainer.firebasestorage.app",
  messagingSenderId: "234869309599",
  appId: "1:234869309599:web:b096a83bfc31b6fd14e2aa",
  measurementId: "G-CSDLVS43P7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser, not SSR)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
