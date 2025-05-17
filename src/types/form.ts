export type QuestionType = 
  | 'text' 
  | 'longText' 
  | 'number' 
  | 'email' 
  | 'url' 
  | 'date' 
  | 'singleChoice' 
  | 'multipleChoice' 
  | 'rating' 
  | 'fileUpload'
  | 'phone'
  | 'boolean';

export interface Choice {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  choices?: Choice[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  properties?: {
    placeholder?: string;
    defaultValue?: any;
    maxLength?: number;
  };
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  settings: {
    showProgressBar: boolean;
    submitButtonText: string;
    successMessage: string;
    allowMultipleSubmissions: boolean;
    redirectUrl?: string;
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: {
    [questionId: string]: any;
  };
  metadata: {
    startedAt: Date;
    completedAt: Date;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

export interface FormStats {
  formId: string;
  totalResponses: number;
  completionRate: number;
  averageTimeToComplete: number; // in seconds
  responsesByDate: {
    date: string;
    count: number;
  }[];
  responsesByQuestion: {
    questionId: string;
    questionTitle: string;
    responses: {
      answer: any;
      count: number;
    }[];
  }[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>;
}