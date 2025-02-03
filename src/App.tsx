// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import QuizCreator from './components/quiz/QuizCreator';
import QuizGame from './components/quiz/QuizGame';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-quiz" element={<PrivateRoute><QuizCreator /></PrivateRoute>} />
        <Route path="/quiz/:quizCode" element={<PrivateRoute><QuizGame /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

export default App;