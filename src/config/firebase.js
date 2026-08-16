import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAx1kjRtaeeEhqdTJE7Q5_FlaSQLmFBzhI",
  authDomain: "metrico-dashboard-2026.firebaseapp.com",
  projectId: "metrico-dashboard-2026",
  storageBucket: "metrico-dashboard-2026.firebasestorage.app",
  messagingSenderId: "140680893264",
  appId: "1:140680893264:web:371040f89633e2a9529255"
};

let app, auth, db, appCheck;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Cortafuegos de Infraestructura Firebase App Check (reCAPTCHA v3)
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        self.FIREBASE_APPCHECK_EXECUTE_IN_DEV_WITH_BUILD_TOKEN = true;
      }

      const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lf_METRICO_ENTERPRISE_RECAPTCHA_V3_KEY';
      try {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true
        });
      } catch (appCheckErr) {
        console.warn("App Check initialization info:", appCheckErr.message);
      }
    }
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

const appId = import.meta.env.VITE_FIREBASE_APP_ID || 'urgencias-dashboard';

export { app, auth, db, appCheck, appId, firebaseConfig };
