import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBI8uxjlqLRyxO_Pka25313Io0v1l4RDsc",
  authDomain: "powerbyte-bs.firebaseapp.com",
  databaseURL: "https://powerbyte-bs-default-rtdb.firebaseio.com",
  projectId: "powerbyte-bs",
  storageBucket: "powerbyte-bs.appspot.com",
  messagingSenderId: "420256539317",
  appId: "1:420256539317:web:d0085da66ef926311a54fc",
  measurementId: "G-MG0YP34DXR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

export { app, auth };
