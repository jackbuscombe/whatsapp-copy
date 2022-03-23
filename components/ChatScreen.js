import { getAuth } from "firebase/auth";
import styled from "styled-components";
import { useRouter } from "next/router";
import { Avatar, IconButton } from "@material-ui/core";
import { AttachFile, InsertEmoticon, Mic, MoreVert } from "@material-ui/icons";
import { collection, query, where, onSnapshot, doc, orderBy, setDoc, serverTimestamp, addDoc } from "firebase/firestore";
import Message from "./Message";
import { db } from "../firebase";
import { useState, useEffect, useRef } from "react";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
// import { useAuth } from "../firebase";

function ChatScreen({ chat, messages }) {
	const { currentUser } = getAuth();
	const router = useRouter();
	const [input, setInput] = useState("");
	const [messagesSnapshot, setMessagesSnapshot] = useState([]);
	const [recipientSnapshot, setRecipientSnapshot] = useState();
	const endOfMessagesRef = useRef(null);

	const messagesQuery = query(collection(db, "chats", router.query.id, "messages"), orderBy("timestamp", "asc"));
	const recipientQuery = query(collection(db, "users"), where("email", "==", getRecipientEmail(chat.users, currentUser)));

	useEffect(() => {
		onSnapshot(messagesQuery, (snapshot) => setMessagesSnapshot(snapshot.docs.map((doc) => doc.data())));
		onSnapshot(recipientQuery, (snapshot) => setRecipientSnapshot(snapshot));
	}, [router.query.id]);

	const showMessages = () => {
		if (messagesSnapshot) {
			return messagesSnapshot.map((message) => <Message key={message.id} user={message.user} message={message.message} timestamp={message.timestamp?.toDate().getTime()} />);
		} else {
			return JSON.parse(messages).map((message) => <Message key={message.id} user={message.user} message={message.message} />);
		}
	};

	const scrollToBottom = () => {
		endOfMessagesRef.current.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	const sendMessage = (e) => {
		e.preventDefault();

		setDoc(doc(db, "users", currentUser.uid), { lastSeen: serverTimestamp() }, { merge: true });

		addDoc(collection(db, "chats", router.query.id, "messages"), {
			timestamp: serverTimestamp(),
			message: input,
			user: currentUser.email,
			photoURL: currentUser.photoURL,
		});

		setInput("");
		scrollToBottom();
	};

	const recipient = recipientSnapshot?.docs?.[0]?.data();
	const recipientEmail = getRecipientEmail(chat.users, currentUser);

	return (
		<Container>
			<Header>
				{recipient ? <Avatar src={recipient?.photoURL} /> : <Avatar>{recipientEmail[0].toUpperCase()}</Avatar>}

				<HeaderInformation>
					<h3>{recipientEmail}</h3>
					{recipientSnapshot ? <p>Last active: {recipient?.lastSeen?.toDate() ? <TimeAgo datetime={recipient?.lastSeen?.toDate()} /> : "Unavailable"}</p> : <p>Loading last active...</p>}
				</HeaderInformation>
				<HeaderIcons>
					<IconButton>
						<AttachFile />
					</IconButton>
					<IconButton>
						<MoreVert />
					</IconButton>
				</HeaderIcons>
			</Header>

			<MessageContainer>
				{showMessages()}
				<EndOfMessage ref={endOfMessagesRef} />
			</MessageContainer>

			<InputContainer>
				<IconButton>
					<InsertEmoticon />
				</IconButton>
				<Input value={input} onChange={(e) => setInput(e.target.value)} />
				<button hidden disable={!input} type="submit" onClick={sendMessage}>
					Send Message
				</button>
				<IconButton>
					<Mic />
				</IconButton>
			</InputContainer>
		</Container>
	);
}
export default ChatScreen;

const Container = styled.div`
	flex: 0.45;
	border-right: 1px solid whitesmoke;
	height: 100vh;
	min-width: 300px;
	/* max-width: 350px; */
	overflow-y: scroll;

	::-webkit-scrollbar {
		display: none;
	}
`;

const Header = styled.div`
	position: sticky;
	background-color: white;
	z-index: 100;
	top: 0;
	display: flex;
	padding: 11px;
	height: 80px;
	align-items: center;
	border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
	margin-left: 15px;
	flex: 1;

	> h3 {
		margin-bottom: -8px;
	}

	> p {
		font-size: 14px;
		color: gray;
	}
`;

const EndOfMessage = styled.div`
	margin-bottom: 50px;
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
	padding: 30px;
	background-color: #e5ded8;
	min-height: 90vh;
`;

const InputContainer = styled.form`
	display: flex;
	align-items: center;
	padding: 10px;
	position: sticky;
	bottom: 0;
	background-color: white;
	z-index: 100;
`;

const Input = styled.input`
	flex: 1;
	outline: 0;
	border: none;
	border-radius: 10px;
	background-color: whitesmoke;
	padding: 20px;
	margin-left: 15px;
	margin-right: 15px;
`;
