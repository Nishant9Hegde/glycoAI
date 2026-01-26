'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

export * from './provider';
export * from './auth/use-user';


let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (firebaseConfig && firebaseConfig.apiKey && (!getApps() || !getApps().length)) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else if (getApps().length) {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    // This is a fallback, but in a real app you'd want to handle this case
    // where config is missing.
    console.error("Firebase config is missing.");
    // You might throw an error or use a dummy object, depending on your needs.
    return {} as { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore };
  }

  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };
