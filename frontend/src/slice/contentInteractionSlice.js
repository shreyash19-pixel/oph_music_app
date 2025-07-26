import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reactions: {
    likes: 0,
    dislikes: 0,
    userReaction: null // 'like', 'dislike', or null
  },
  comments: [],
  loading: false,
  error: null
};

const contentInteractionSlice = createSlice({
  name: 'contentInteraction',
  initialState,
  reducers: {
    updateReactions: (state, action) => {
      state.reactions = {
        ...state.reactions,
        likes: action.payload.likes,
        dislikes: action.payload.dislikes,
        userReaction: action.payload.userReaction
      };
    },
    setUserReaction: (state, action) => {
      state.reactions.userReaction = action.payload;
    },
    addComment: (state, action) => {
      state.comments = [action.payload, ...state.comments];
    },
    updateComment: (state, action) => {
      state.comments = state.comments.map(comment => 
        comment.id === action.payload.id ? action.payload : comment
      );
    },
    setComments: (state, action) => {
      state.comments = action.payload;
    }
  }
});

export const { 
  updateReactions, 
  setUserReaction,
  addComment, 
  updateComment, 
  setComments 
} = contentInteractionSlice.actions;

export default contentInteractionSlice.reducer; 