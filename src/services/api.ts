// frontend/src/services/api.ts
import axios from 'axios';

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

// Add auth token to every request (if available)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication endpoints
export const login = (credentials: { username: string; password: string }) =>
  api.post('/auth/login', credentials);

export const register = (data: { username: string; email: string; password: string }) =>
  api.post('/auth/register', data);

// Quiz endpoints
export const getMyQuizzes = () => api.get('/quiz/my-quizzes');
export const getQuiz = (quizCode: string) => api.get(`/quiz/${quizCode}`);
export const createQuiz = (data: any) => api.post('/quiz', data);
export const joinQuiz = (quizCode: string) => api.post(`/quiz/${quizCode}/join`);
export const submitAnswer = (data: any) => api.post('/quiz/answer', data);
export const startQuiz = (quizCode: string) => api.post(`/quiz/${quizCode}/start`);
export const getLeaderboard = (quizCode: string) => api.get(`/quiz/${quizCode}/leaderboard`);


export default {
  login,
  register,
  getMyQuizzes,
  getQuiz,
  createQuiz,
  joinQuiz,
  submitAnswer,
  startQuiz,
  getLeaderboard  // Add this to the default export

};
