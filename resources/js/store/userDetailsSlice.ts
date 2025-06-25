import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserDetail {
  id: number;
  user_id: number;
  nickname: string;
  hobbies: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface UserDetailsState {
  userDetails: UserDetail[];
}

const initialState: UserDetailsState = {
  userDetails: [],
};

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    addUserDetail: (state, action: PayloadAction<UserDetail>) => {
      state.userDetails.unshift(action.payload);
    },
    setUserDetails: (state, action: PayloadAction<UserDetail[]>) => {
      state.userDetails = action.payload;
    },
    updateUserDetail: (state, action: PayloadAction<UserDetail>) => {
      const idx = state.userDetails.findIndex(d => d.id === action.payload.id);
      if (idx !== -1) {
        state.userDetails[idx] = action.payload;
      }
    },
    deleteUserDetail: (state, action: PayloadAction<number>) => {
      state.userDetails = state.userDetails.filter(d => d.id !== action.payload);
    },
  },
});

export const { addUserDetail, setUserDetails, updateUserDetail, deleteUserDetail } = userDetailsSlice.actions;
export default userDetailsSlice.reducer; 