// frontend/src/components/quiz/QuizCreator.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../../utils/axios';

interface QuestionForm {
    text: string;
    options: { text: string }[];
    correct_answer: string;
    timeLimit: number;
}

interface Quiz {
    title: string;
    description: string;
    questions: QuestionForm[];
    timeLimit: number;
}

const QuizCreator = () => {
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz>({
        title: '',
        description: '',
        questions: [],
        timeLimit: 30
    });

    const [currentQuestion, setCurrentQuestion] = useState<QuestionForm>({
        text: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correct_answer: '',
        timeLimit: 30
    });

    const validateQuestion = () => {
        if (!currentQuestion.text.trim()) {
            alert('Please enter a question');
            return false;
        }

        const validOptions = currentQuestion.options.filter(opt => opt.text.trim());
        if (validOptions.length < 2) {
            alert('Please enter at least 2 options');
            return false;
        }

        if (!currentQuestion.correct_answer) {
            alert('Please select a correct answer');
            return false;
        }

        return true;
    };

    const handleAddQuestion = () => {
        if (!validateQuestion()) return;

        setQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, currentQuestion]
        }));

        setCurrentQuestion({
            text: '',
            options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
            correct_answer: '',
            timeLimit: 30
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (quiz.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
console.log('quiz:', quiz);

        try {
            const response = await instance.post('/api/quiz', quiz);
            navigate(`/quiz/${response.data.quiz_code}`);
        } catch (error) {
            console.error('Failed to create quiz:', error);
            alert('Failed to create quiz. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Create New Quiz</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Details */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Quiz Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-md"
                            value={quiz.title}
                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full p-2 border rounded-md"
                            value={quiz.description}
                            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Default Time Limit (seconds)</label>
                        <input
                            type="number"
                            min="10"
                            className="w-full p-2 border rounded-md"
                            value={quiz.timeLimit}
                            onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 30 })}
                        />
                    </div>
                </div>

                {/* Current Question Form */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Add Question</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Question Text"
                            className="w-full p-2 border rounded-md"
                            value={currentQuestion.text}
                            onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                text: e.target.value
                            })}
                        />

                        <div>
                            <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                            <input
                                type="number"
                                min="10"
                                className="w-full p-2 border rounded-md"
                                value={currentQuestion.timeLimit}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    timeLimit: parseInt(e.target.value) || 30
                                })}
                            />
                        </div>

                        {currentQuestion.options.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                className="w-full p-2 border rounded-md"
                                value={option.text}
                                onChange={(e) => {
                                    const newOptions = [...currentQuestion.options];
                                    newOptions[index] = { text: e.target.value };
                                    setCurrentQuestion({
                                        ...currentQuestion,
                                        options: newOptions
                                    });
                                }}
                            />
                        ))}

                        <div>
                            <label className="block text-sm font-medium mb-1">Correct Answer</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={currentQuestion.correct_answer}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    correct_answer: e.target.value
                                })}
                            >
                                <option value="">Select Correct Answer</option>
                                {currentQuestion.options.map((option, index) => (
                                    option.text && (
                                        <option key={index} value={option.text}>
                                            {option.text}
                                        </option>
                                    )
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Add Question
                        </button>
                    </div>
                </div>

                {/* Added Questions Preview */}
                {quiz.questions.length > 0 && (
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">Added Questions</h2>
                        <div className="space-y-4">
                            {quiz.questions.map((q, index) => (
                                <div key={index} className="border p-4 rounded-md">
                                    <p className="font-medium">{q.text}</p>
                                    <p className="text-sm text-gray-500 mb-2">Time: {q.timeLimit}s</p>
                                    <ul className="list-disc pl-5">
                                        {q.options.map((opt, optIndex) => (
                                            opt.text && (
                                                <li key={optIndex} className={opt.text === q.correct_answer ? 'text-green-600' : ''}>
                                                    {opt.text} {opt.text === q.correct_answer && '(Correct)'}
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="border-t pt-6">
                    <button
                        type="submit"
                        disabled={quiz.questions.length === 0}
                        className={`w-full py-2 rounded-md ${quiz.questions.length === 0
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        Create Quiz
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizCreator;