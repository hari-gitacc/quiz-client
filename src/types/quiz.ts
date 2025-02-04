// frontend/src/types/quiz.ts
export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer?: string;
    timeLimit: number;
  }
  
  export interface Quiz {
    id: number;
    title: string;
    description: string;
    quizCode: string;
    timeLimit: number;
    questions: Question[];
    isActive: boolean;
    creatorId: number;
  }
  
  export interface QuizResponse {
    userId: number;
    quizId: number;
    questionId: number;
    answer: string;
    score: number;
    timeSpent: number;
  }

  export interface Option {
    id: number;
    text: string;
  }
  