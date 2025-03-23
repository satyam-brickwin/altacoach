// Message types for chat
export interface Message {
  id?: string;
  text: string;
  role: 'user' | 'assistant' | 'system';
  sender: 'user' | 'ai' | 'system';
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = 'ADMIN' | 'TRAINER' | 'USER';

// User interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | 'user' | 'admin';
  company?: string;
  language: string;
  conversations: Conversation[];
}

export type ContentType = 'COURSE' | 'EXERCISE' | 'FAQ' | 'GUIDE' | 'EXAMPLE' | 'article' | 'video' | 'quiz';

// Training content types
export interface TrainingContent {
  id: string;
  title: string;
  contentType: string;
  language: string;
  content: string;
  keywords?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Client interface
export interface Client {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  language: string;
  userId: string;
  messages?: Message[];
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Question interfaces
export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: QuestionDifficulty;
  contentId: string;
}

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Feedback interface
export interface Feedback {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Analytics interface
export interface Analytics {
  id: string;
  sessionCount: number;
  messageCount: number;
  userCount: number;
  averageRating: number;
  date: Date;
  metadata?: Record<string, unknown>;
}

// AI Prompt types
export interface AIPrompt {
  id?: string;
  name: string;
  description: string;
  content: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 