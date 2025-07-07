import { configureStore } from '@reduxjs/toolkit';
import userDetailsReducer from './userDetailsSlice';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    userDetails: userDetailsReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 