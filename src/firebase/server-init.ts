import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App;
let firestore: Firestore;

if (!getApps().length) {
  app = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  app = getApp();
}

firestore = getFirestore(app);

export { firestore as db };
