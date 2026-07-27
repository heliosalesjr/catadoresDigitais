import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Em dev, com VITE_USE_EMULATORS=true, tudo roda nos emuladores locais —
// nada toca o projeto Firebase real. Guardado por import.meta.env.DEV para
// nunca vazar para um build de produção.
export const usingEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true'

// No modo emulador o projectId precisa bater com o --project do
// `npm run emulators`, senão o app grava num namespace diferente do que as
// rules e a Emulator UI enxergam.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: usingEmulators ? 'demo-catadores' : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

if (usingEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
