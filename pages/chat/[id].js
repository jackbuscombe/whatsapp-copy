import Head from "next/head";
import styled from "styled-components";
import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/ChatScreen";
import { doc, getDocs, query, orderBy, where, collection, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import getRecipientEmail from "../../utils/getRecipientEmail";

function Chat({ messages, chat }) {
	const { currentUser } = getAuth();

	return (
		<Container>
			<Head>
				<title>Chat with {getRecipientEmail(chat.users, currentUser)}</title>
			</Head>
			<Sidebar />
			<ChatContainer>
				<ChatScreen chat={chat} messages={messages} />
			</ChatContainer>
		</Container>
	);
}
export default Chat;

export async function getServerSideProps(context) {
	const ref = doc(db, "chats", context.query.id);
	// PREP THE MESSAGES ON THE SERVER
	const messagesQuery = query(collection(db, "chats", context.query.id, "messages"), orderBy("timestamp", "asc"));
	const messagesRes = await getDocs(messagesQuery);
	console.log(messagesRes);

	const messages = messagesRes.docs
		.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))
		.map((messages) => ({
			...messages,
			timestamp: messages.timestamp.toDate().getTime(),
		}));

	// const chatRef = getChat.data();
	// console.log("messages.docs", chatRef);

	// PREP THE CHATS
	const chatRes = await getDoc(ref);
	const chat = {
		id: chatRes.id,
		...chatRes.data(),
	};

	return {
		props: {
			messages: JSON.stringify(messages),
			chat: chat,
		},
	};
}

const Container = styled.div`
	display: flex;
`;

const ChatContainer = styled.div`
	flex: 1;
	height: 100vh;

	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;

	::-webkit-scrollbar {
		display: none; /* for Chrome, Safari, and Opera */
	}
`;
