import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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

// Initialize App Check with reCAPTCHA v3
// Site key is public and safe to include in client-side code
const RECAPTCHA_V3_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || '6LckQFwsAAAAAFextFX1Zhw4zdxjn2QPZQpnzdUE';

// Initialize App Check (only in browser)
if (typeof window !== 'undefined' && RECAPTCHA_V3_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error('App Check initialization failed:', error);
    // App will continue but Cloud Functions may reject requests
  }
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

// Initialize Analytics (only in browser, not SSR)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
