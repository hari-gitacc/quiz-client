// QuizGame.tsx
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WebSocketService from '../../services/websocket';
import api from '../../services/api';
import { Quiz, Question } from '../../types/quiz';
import { getUserFromToken } from '../../utils/auth';
import QuizQuestion from './QuizQuestion';
import Leaderboard from './Leaderboard';
import BackButton from '../common/BackButton';

// Define a type for participant info (should match your backend)
interface Participant {
  user_id: number;
  username: string;
  email: string;
}

interface TimerProviderProps {
  children: React.ReactNode;
  initialTime: number;
  onTimeUp: () => void;
}

const TimerProvider = ({ children, initialTime, onTimeUp }: TimerProviderProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Use a timer to count down every second.
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [initialTime, onTimeUp]);

  return (
    <div className="quiz-container">
      <div className="timer">Time Left: {timeLeft}s</div>
      {children}
    </div>
  );
};

const QuizGame = () => {
  const navigate = useNavigate();
  const { quizCode } = useParams<{ quizCode: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [participants, setParticipants] = useState<number>(0);
  // New state for participant list details
  const [participantList, setParticipantList] = useState<Participant[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string>('');
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);


  useEffect(() => {
    const handleParticipantList = (data: any) => {
        console.log('Received participant list update:', data);
        if (data?.participants) {
            setParticipantList(data.participants);
            setParticipants(data.participants.length);
        }
    };

    WebSocketService.on('participant_list', handleParticipantList);

    return () => {
        WebSocketService.off('participant_list', handleParticipantList);
    };
}, []);
  

  // Memoize current question to avoid unnecessary re-renders
  const memoizedQuestion = useMemo(() => currentQuestion, [currentQuestion?.id]);

  const loadQuiz = useCallback(async () => {
    try {
      const response = await api.getQuiz(quizCode!);
      const quizData = response.data;
      setQuiz(quizData);
      const user = getUserFromToken();
      if (user) {
        // Determine host by comparing quiz.creator_id with current user id.
        setIsCreator(quizData.creator_id === user.user_id);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
      navigate('/');
    }
  }, [quizCode, navigate]);

  const setupWebSocketHandlers = useCallback(() => {
    WebSocketService.clearAllHandlers();

    WebSocketService.on('question', (data: any) => {
      // When a new question is received, clear any waiting message.
      setWaitingMessage(null);
      if (data?.question) {
        setCurrentQuestion(data.question);
        setTimeLeft(data.question.time_limit || 30);
        timeLeftRef.current = data.question.time_limit || 30;
        setCurrentQuestionIndex(data.index);
        // Mark quiz as active
        setQuiz(prev => prev ? { ...prev, isActive: true } : null);
      }
    });

    WebSocketService.on('quiz_start', (data: any) => {
      setQuiz(prev => prev ? { ...prev, isActive: true } : null);
    });

    WebSocketService.on('participant_update', (data: any) => {
      if (typeof data?.count === 'number') {
console.log('Participant count:', data.count);

      }
    });

    // New handler for receiving full participant list details
    WebSocketService.on('participant_list', (data: any) => {
      if (data?.participants) {
        setParticipantList(data.participants);
        // Also update participant count if provided
        if (typeof data.count === 'number') {
          setParticipants(data.count);
        }
      }
    });

    

    // When final leaderboard is received, update state immediately.
    WebSocketService.on('final_leaderboard', (data: any) => {
      console.log('Final leaderboard received:', data);
      setFinalLeaderboard(data);
      setIsFinished(true);
      // Stop any timer by setting time left to 0.
      setTimeLeft(0);
    });

    WebSocketService.on('quiz_end_wait', (data: any) => {
      console.log('Quiz end wait message received:', data);
      // Display waiting message to participants.
      if (data?.message) {
        setWaitingMessage(data.message);
      }
    });

    WebSocketService.on('error', console.error);
  }, []);

  // Use a separate state for waiting message.
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (!quizCode) {
        navigate('/');
        return;
      }
      try {
        const user = getUserFromToken();
        if (!user) {
          navigate('/login');
          return;
        }
        await loadQuiz();
        // Connect WebSocket after quiz is loaded.
        await WebSocketService.connect(quizCode);
        setupWebSocketHandlers();
      } catch (error) {
        console.error('Failed to initialize quiz:', error);
      }
    };

    initializeQuiz();

    return () => {
      WebSocketService.clearAllHandlers();
      WebSocketService.disconnect();
    };
  }, [quizCode, navigate, loadQuiz, setupWebSocketHandlers]);

  const handleStartQuiz = useCallback(async () => {
    try {
      await api.startQuiz(quizCode!);
      WebSocketService.send('start_quiz', { quizCode, status: 'started' });
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  }, [quizCode]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz || !currentQuestion) return;
    if (currentQuestionIndex >= quiz.questions.length - 1) {
      // Mark quiz finished immediately.
      setIsFinished(true);
      return;
    }
    WebSocketService.send('next_question', {
      quizCode,
      currentIndex: currentQuestionIndex
    });
  }, [currentQuestion, currentQuestionIndex, quiz, quizCode]);

  const handleAnswer = useCallback(async (answer: string) => {
    if (!currentQuestion || !quiz || answeredQuestions.has(currentQuestion.id)) return;
    try {
      const response = await api.submitAnswer({
        quiz_id: quiz.id,
        question_id: currentQuestion.id,
        answer,
        time_spent: currentQuestion.time_limit - timeLeftRef.current
      });
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
      setScore(prev => prev + (response.data.score || 0));
      WebSocketService.send('answer_submitted', {
        quizCode,
        questionId: currentQuestion.id,
        answer,
        userId: getUserFromToken()?.user_id
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }, [currentQuestion, quiz, answeredQuestions, quizCode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    // Run timer only if quiz is active, not finished, and final leaderboard hasn't been received.
    if (timeLeft > 0 && !isFinished && currentQuestion && !finalLeaderboard) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (currentQuestion && !answeredQuestions.has(currentQuestion.id)) {
              handleAnswer('');
            }
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [timeLeft, isFinished, currentQuestion, handleAnswer, handleNextQuestion, answeredQuestions, finalLeaderboard]);

  // --- UI Components ---

  // A component to show the list of participants
  const ParticipantListDisplay = () => (
    <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">
            Participants ({participants})
        </h3>
        <div className="max-h-60 overflow-y-auto">
            {participantList.length > 0 ? (
                <ul className="space-y-2">
                    {participantList.map((participant) => (
                        <li 
                            key={participant.user_id}
                            className="flex items-center p-2 border-b border-gray-100 last:border-b-0"
                        >
                            <span className="font-medium text-gray-800">
                                {participant.username}
                            </span>
                            
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center py-4">
                    No participants have joined yet
                </p>
            )}
        </div>
    </div>
);

  // Teacher (host) view when quiz hasn't started.
  const TeacherPreQuizView = useCallback(() => (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Quiz Setup</h2>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Share this code with your students:</p>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-indigo-600">{quizCode}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(quizCode!);
              setCopySuccess('Copied!');
              setTimeout(() => setCopySuccess(''), 2000);
            }}
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            {copySuccess ? copySuccess : 'Copy Code'}
          </button>
        </div>
      </div>
      <ParticipantListDisplay />
      <div className="mt-4 text-sm text-gray-500">
        Share the quiz code with your students and wait for them to join.
      </div>
      <button
        onClick={handleStartQuiz}
        className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md transition-colors"
      >
        Start Quiz
      </button>
    </div>
  ), [quizCode, participants, handleStartQuiz, copySuccess, participantList]);

  // Teacher view when quiz is running.
  const TeacherQuizView = useCallback(() => {
    if (finalLeaderboard) {
      return <Leaderboard quizCode={quizCode!} finalScores={true} />;
    }
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Live Quiz Status</h2>
        <p className="text-gray-600 mb-2">
          Current Question: {currentQuestionIndex + 1} / {quiz?.questions?.length || '-'}
        </p>
        {currentQuestion ? (
          <>
            <p className="font-medium mb-2">{currentQuestion.text}</p>
            <p className="text-sm text-gray-500">Waiting for participants’ responses...</p>
          </>
        ) : (
          <p className="text-gray-500">Waiting for the first question...</p>
        )}
        <ParticipantListDisplay />
      </div>
    );
  }, [currentQuestion, currentQuestionIndex, quiz, finalLeaderboard, quizCode, participantList]);

  // Participant view: includes timer, question display, and waiting message.
  const ParticipantQuizView = useCallback(() => (
    <div className="space-y-6">
      {waitingMessage ? (
        <div className="text-center py-12">
          <p className="text-2xl text-gray-700">{waitingMessage}</p>
          {/* Display participant list during waiting, if desired */}
          <ParticipantListDisplay />
        </div>
      ) : memoizedQuestion ? (
        <TimerProvider 
          initialTime={memoizedQuestion.time_limit} 
          onTimeUp={() => {
            if (!answeredQuestions.has(memoizedQuestion.id)) {
              handleAnswer('');
            }
          }}
        >
          <QuizQuestion
            key={memoizedQuestion.id}
            question={memoizedQuestion}
            onAnswer={handleAnswer}
            isAnswered={answeredQuestions.has(memoizedQuestion.id)}
          />
        </TimerProvider>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-700">
            {quiz?.isActive ? 'Loading next question...' : 'Waiting for quiz to start...'}
          </p>
          <ParticipantListDisplay />
        </div>
      )}
    </div>
  ), [memoizedQuestion, answeredQuestions, handleAnswer, quiz?.isActive, waitingMessage, participantList]);

  // Render: For host (isCreator === true) show Teacher views; for others, show Participant view or leaderboard if finished.
  return (
    <div className="max-w-4xl mx-auto p-6">
    {/* Back button on top */}
    <div className="mb-4">
      <BackButton />
    </div>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">{quiz?.title}</h1>
      {isCreator && (
        <div className="text-sm text-gray-600">Quiz Code: {quizCode}</div>
      )}
    </div>
    
    {/* Render host or participant views */}
    {isCreator ? (
      !quiz?.isActive ? (
        <TeacherPreQuizView />
      ) : (
        <TeacherQuizView />
      )
    ) : (
      (isFinished || finalLeaderboard) ? (
        <Leaderboard quizCode={quizCode!} finalScores={true} />
      ) : (
        <ParticipantQuizView />
      )
    )}
  </div>
);
  
};

export default QuizGame;
