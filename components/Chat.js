import styled from "styled-components";
import { Avatar } from "@material-ui/core";
import { collection, query, where, getDocs } from "firebase/firestore";
import getRecipientEmail from "../utils/getRecipientEmail";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useRouter } from "next/router";

function Chat({ id, users }) {
	const router = useRouter();
	const { currentUser } = getAuth();
	const [recipient, setRecipient] = useState();
	const [recipientEmail, setRecipientEmail] = useState();
	const [recipientImage, setRecipientImage] = useState();

	useEffect(() => {
		const getEmailAndImage = async () => {
			const email = await getRecipientEmail(users, currentUser);
			setRecipientEmail(email);

			const q = query(collection(db, "users"), where("email", "==", email));
			const querySnapshot = await getDocs(q);
			setRecipient(querySnapshot?.docs?.[0]?.data());
			// setRecipientImage(querySnapshot?.docs?.[0]?.data()?.photoURL);
		};
		getEmailAndImage();
	}, [currentUser]);

	const enterChat = () => {
		router.push(`/chat/${id}`);
	};

	return (
		<Container onClick={enterChat}>
			{recipient ? <UserAvatar src={recipient?.photoURL} /> : recipientEmail ? <UserAvatar>{recipientEmail[0].toUpperCase()} </UserAvatar> : <UserAvatar />}
			{/* <UserAvatar src={recipient?.photoURL} /> */}
			<p>{recipientEmail}</p>
		</Container>
	);
}
export default Chat;

const Container = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	padding: 15px;
	word-break: break-work;

	:hover {
		background-color: #e9eaeb;
	}
`;

const UserAvatar = styled(Avatar)`
	margin: 5px;
	margin-right: 15px;
`;
