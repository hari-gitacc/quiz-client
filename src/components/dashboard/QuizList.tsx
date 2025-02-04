// frontend/src/components/dashboard/QuizList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Quiz } from '../../types/quiz';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await api.getMyQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log(quizzes);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium">Your Quizzes</h2>
      </div>
      <div className="border-t border-gray-200">
        {quizzes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You haven't created any quizzes yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium">{quiz.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                      {quiz.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                      Code: {quiz.quiz_code}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                
                      <button
                        onClick={() => navigate(`/quiz/${quiz.quiz_code}`)}
                        className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-900"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuizList;