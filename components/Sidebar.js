import styled from "styled-components";
import { Avatar, Button, IconButton } from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import ChatIcon from "@material-ui/icons/Chat";
import SearchIcon from "@material-ui/icons/Search";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where, getDocs, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import Chat from "./Chat";

function Sidebar() {
	const { currentUser } = getAuth();
	const [chatsSnapshot, setChatsSnapshot] = useState();

	useEffect(() => {
		const getSnapshot = async () => {
			console.log("getSnapshot Firing", currentUser);
			const userChatRef = query(collection(db, "chats"), where("users", "array-contains", currentUser.email));
			const getDocsVar = await getDocs(userChatRef);
			setChatsSnapshot(getDocsVar);
			console.log("setSnapshotDone", chatsSnapshot);
		};
		getSnapshot();
	}, [currentUser]);

	const createChat = () => {
		console.log("Checking snapshot", chatsSnapshot);
		const input = prompt("Please enter an email address you to chat with");

		if (!input) return null;

		// Check if email is valid
		if (EmailValidator.validate(input) && !chatAlreadyExists(input) && input != currentUser.email) {
			// We add the chat into the DB 'chats' collection if it doesn't already exist and is valid.
			addDoc(collection(db, "chats"), {
				users: [currentUser.email, input],
			});
		}
	};

	const chatAlreadyExists = (recipientEmail) => !!chatsSnapshot.docs.find((chat) => chat.data().users.find((user) => user == recipientEmail));

	return (
		<Container>
			<Header>
				<UserAvatar
					src={currentUser.photoURL}
					onClick={() => {
						auth.signOut();
						location.reload();
					}}
				/>
				<IconsContainer>
					<IconButton>
						<ChatIcon />
					</IconButton>
					<IconButton>
						<MoreVert />
					</IconButton>
				</IconsContainer>
			</Header>
			<Search>
				<SearchIcon />
				<SearchInput placeholder="Search in chats" />
			</Search>

			<SidebarButton onClick={createChat}>Start a new chat</SidebarButton>

			{/* List of chats */}
			{chatsSnapshot && chatsSnapshot.docs.map((chat) => <Chat key={chat.id} id={chat.id} users={chat.data().users} />)}
		</Container>
	);
}
export default Sidebar;

const Container = styled.div``;

const Search = styled.div`
	display: flex;
	align-items: center;
	padding: 20px;
	border-radius: 2px;
`;

const SidebarButton = styled(Button)`
	width: 100%;

	&&& {
		border-top: 1px solid whitesmoke;
		border-bottom: 1px solid whitesmoke;
	}
`;

const SearchInput = styled.input`
	outline: none;
	border: none;
	flex: 1;
`;

const Header = styled.div`
	display: flex;
	position: sticky;
	top: 0;
	background-color: white;
	z-index: 1;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	height: 80px;
	border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
	cursor: pointer;
	:hover {
		opacity: 0.8;
	}
`;
const IconsContainer = styled.div``;
