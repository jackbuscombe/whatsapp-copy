import "../styles/globals.css";
import { useAuth, db } from "../firebase";
import Login from "./login";
import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function MyApp({ Component, pageProps }) {
	const { user, loadingUser } = useAuth();

	useEffect(() => {
		if (user) {
			setDoc(
				doc(db, "users", user.uid),
				{
					email: user.email,
					lastSeen: serverTimestamp(),
					photoURL: user.photoURL,
					messages: [],
				},
				{ merge: true }
			);
		}
	}, [user]);

	if (loadingUser) return <Loading />;
	if (!user) return <Login />;
	if (user) return <Component {...pageProps} />;
}

export default MyApp;
