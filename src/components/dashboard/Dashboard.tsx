// frontend/src/components/dashboard/Dashboard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizList from './QuizList';
import Header from '../common/Header';

const Dashboard = () => {
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode) {
      navigate(`/quiz/${joinCode}`);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-lg font-medium">Quick Actions</h2>
                <button
                  onClick={() => navigate('/create-quiz')}
                  className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create New Quiz
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium">Join a Quiz</h3>
                <form onSubmit={handleJoinQuiz} className="mt-4">
                  <input
                    id="quizCode"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition duration-300 pr-12"
                    placeholder="Enter Quiz Code"
                    required
                  />

                  <button
                    type="submit"
                    className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Join Quiz
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Quiz List */}
          <div className="lg:col-span-2">
            <QuizList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;