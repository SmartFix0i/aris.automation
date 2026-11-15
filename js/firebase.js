
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    push,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBlQj6ckyxj6R37Vy_wUUq3sgZS9WX8600",
    authDomain: "aris-ai-36303.firebaseapp.com",
    databaseURL: "https://aris-ai-36303-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aris-ai-36303",
    storageBucket: "aris-ai-36303.firebasestorage.app",
    messagingSenderId: "1098005195954",
    appId: "1:1098005195954:web:9a6d37a65713f460ecadab"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export {
    app,
    auth,
    database,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    ref,
    set,
    get,
    push,
    remove,
    onValue
};

console.log("ARIS Firebase Initialized Successfully!");
