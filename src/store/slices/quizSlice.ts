// frontend/src/store/slices/quizSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Quiz } from '../../types/quiz';

interface QuizState {
  currentQuiz: Quiz | null;
  myQuizzes: Quiz[];
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  currentQuiz: null,
  myQuizzes: [],
  loading: false,
  error: null,
};

export const fetchMyQuizzes = createAsyncThunk(
  'quiz/fetchMyQuizzes',
  async () => {
    const response = await api.getMyQuizzes();
    return response.data;
  }
);

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData: Partial<Quiz>) => {
    const response = await api.createQuiz(quizData);
    return response.data;
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyQuizzes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.myQuizzes = action.payload;
      })
      .addCase(fetchMyQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch quizzes';
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.myQuizzes.push(action.payload);
      });
  },
});

export const { setCurrentQuiz, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;