// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCv3TJPHj1Ank1-a3Xwmt1kqI9VmWFRNg8",
	authDomain: "whatsapp-copy-9aae1.firebaseapp.com",
	projectId: "whatsapp-copy-9aae1",
	storageBucket: "whatsapp-copy-9aae1.appspot.com",
	messagingSenderId: "922413538886",
	appId: "1:922413538886:web:b23e8a12ffab1a8896b447",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();
const provider = new GoogleAuthProvider();

// Custom Hook
export function useAuth() {
	const [user, setUser] = useState();
	const [loadingUser, setLoadingUser] = useState(true);

	useEffect(() => {
		setLoadingUser(true);
		const unsub = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoadingUser(false);
		});
		return unsub();
	}, []);

	return { user, loadingUser };
}

export { app, db, storage, auth, provider };
