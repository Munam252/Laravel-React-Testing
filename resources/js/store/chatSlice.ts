import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  last_seen_at?: string;
  is_typing?: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_deleted_for_both: boolean;
  deleted_by_sender: boolean;
}

interface ChatState {
  messages: Message[];
  otherUser: User | null;
}

const initialState: ChatState = {
  messages: [],
  otherUser: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    setOtherUser(state, action: PayloadAction<User>) {
      state.otherUser = action.payload;
    },
    setOtherUserTyping(state, action: PayloadAction<boolean>) {
      if (state.otherUser) state.otherUser.is_typing = action.payload;
    },
    setOtherUserOnline(state, action: PayloadAction<boolean>) {
      if (state.otherUser) state.otherUser.last_seen_at = action.payload ? new Date().toISOString() : state.otherUser.last_seen_at;
    },
  },
});

export const { setMessages, addMessage, setOtherUser, setOtherUserTyping, setOtherUserOnline } = chatSlice.actions;
export default chatSlice.reducer; 