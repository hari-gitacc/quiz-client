// QuizQuestion.tsx
import { useState, useEffect, memo } from "react";

interface Props {
  question: Question;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
}

const QuizQuestion = memo(({ question, onAnswer, isAnswered }: Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer('');
  }, [question.id]);

  const handleAnswerChange = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswer && !isAnswered) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">{question.text}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`block p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedAnswer === option.text ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}
              ${isAnswered ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="radio"
              name="answer"
              value={option.text}
              checked={selectedAnswer === option.text}
              onChange={() => handleAnswerChange(option.text)}
              disabled={isAnswered}
              className="mr-3"
            />
            <span>{option.text}</span>
          </label>
        ))}

        <button
          type="submit"
          disabled={!selectedAnswer || isAnswered}
          className={`w-full py-2 px-4 rounded-md text-white transition-colors
            ${!selectedAnswer || isAnswered
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isAnswered ? 'Answer Submitted' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
});

export default QuizQuestion;