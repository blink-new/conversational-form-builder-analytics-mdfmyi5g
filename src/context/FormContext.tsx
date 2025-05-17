import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Form, FormResponse, FormTemplate, Question } from '../types/form';

interface FormContextType {
  forms: Form[];
  currentForm: Form | null;
  responses: FormResponse[];
  templates: FormTemplate[];
  activeQuestion: number;
  
  // Form CRUD
  createForm: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => Form;
  getForm: (id: string) => Form | null;
  updateForm: (id: string, form: Partial<Form>) => Form | null;
  deleteForm: (id: string) => boolean;
  
  // Question operations
  addQuestion: (formId: string, question: Omit<Question, 'id'>) => Question | null;
  updateQuestion: (formId: string, questionId: string, updates: Partial<Question>) => Question | null;
  reorderQuestions: (formId: string, newOrder: string[]) => boolean;
  deleteQuestion: (formId: string, questionId: string) => boolean;
  
  // Form submission
  submitResponse: (response: Omit<FormResponse, 'id'>) => FormResponse;
  getResponses: (formId: string) => FormResponse[];

  // Template operations
  createFromTemplate: (templateId: string) => Form | null;

  // Form viewing navigation
  setActiveQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Mock data for initial forms
const initialForms: Form[] = [
  {
    id: '1',
    title: 'Customer Feedback',
    description: 'Help us improve our products and services by providing your feedback',
    questions: [
      {
        id: 'q1',
        type: 'text',
        title: 'What is your name?',
        required: true,
        properties: {
          placeholder: 'Enter your full name',
        },
      },
      {
        id: 'q2',
        type: 'email',
        title: 'What is your email address?',
        required: true,
        properties: {
          placeholder: 'example@email.com',
        },
      },
      {
        id: 'q3',
        type: 'singleChoice',
        title: 'How satisfied are you with our service?',
        required: true,
        choices: [
          { id: 'c1', label: 'Very Satisfied', value: 'very_satisfied' },
          { id: 'c2', label: 'Satisfied', value: 'satisfied' },
          { id: 'c3', label: 'Neutral', value: 'neutral' },
          { id: 'c4', label: 'Dissatisfied', value: 'dissatisfied' },
          { id: 'c5', label: 'Very Dissatisfied', value: 'very_dissatisfied' },
        ],
      },
      {
        id: 'q4',
        type: 'longText',
        title: 'What can we do to improve our service?',
        required: false,
        properties: {
          placeholder: 'Your suggestions help us improve',
        },
      },
    ],
    settings: {
      showProgressBar: true,
      submitButtonText: 'Submit Feedback',
      successMessage: 'Thank you for your feedback!',
      allowMultipleSubmissions: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock templates
const initialTemplates: FormTemplate[] = [
  {
    id: 't1',
    title: 'Customer Feedback',
    description: 'A template for collecting customer feedback about your products or services',
    category: 'Feedback',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
    form: {
      title: 'Customer Feedback',
      description: 'We value your feedback! Please take a moment to share your thoughts.',
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'What is your name?',
          required: true,
          properties: {
            placeholder: 'Enter your full name',
          },
        },
        {
          id: 'q2',
          type: 'email',
          title: 'What is your email address?',
          required: true,
          properties: {
            placeholder: 'Your email address',
          },
        },
        {
          id: 'q3',
          type: 'singleChoice',
          title: 'How would you rate our product/service?',
          required: true,
          choices: [
            { id: 'c1', label: '★★★★★ (Excellent)', value: '5' },
            { id: 'c2', label: '★★★★ (Good)', value: '4' },
            { id: 'c3', label: '★★★ (Average)', value: '3' },
            { id: 'c4', label: '★★ (Below Average)', value: '2' },
            { id: 'c5', label: '★ (Poor)', value: '1' },
          ],
        },
        {
          id: 'q4',
          type: 'longText',
          title: 'Do you have any specific feedback for us?',
          required: false,
          properties: {
            placeholder: 'Your feedback helps us improve...',
          },
        },
      ],
      settings: {
        showProgressBar: true,
        submitButtonText: 'Submit Feedback',
        successMessage: 'Thank you for your valuable feedback!',
        allowMultipleSubmissions: true,
      },
    },
  },
  {
    id: 't2',
    title: 'Event Registration',
    description: 'A template for collecting event registrations with attendee information',
    category: 'Events',
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80',
    form: {
      title: 'Event Registration Form',
      description: 'Register for our upcoming event. Please fill out the information below.',
      questions: [
        {
          id: 'q1',
          type: 'text',
          title: 'Full Name',
          required: true,
          properties: {
            placeholder: 'Enter your full name',
          },
        },
        {
          id: 'q2',
          type: 'email',
          title: 'Email Address',
          required: true,
          properties: {
            placeholder: 'Your email address',
          },
        },
        {
          id: 'q3',
          type: 'phone',
          title: 'Phone Number',
          required: true,
          properties: {
            placeholder: 'Your phone number',
          },
        },
        {
          id: 'q4',
          type: 'singleChoice',
          title: 'Which session will you attend?',
          required: true,
          choices: [
            { id: 'c1', label: 'Morning Session (9 AM - 12 PM)', value: 'morning' },
            { id: 'c2', label: 'Afternoon Session (1 PM - 4 PM)', value: 'afternoon' },
            { id: 'c3', label: 'Full Day (9 AM - 4 PM)', value: 'full_day' },
          ],
        },
        {
          id: 'q5',
          type: 'multipleChoice',
          title: 'What topics are you interested in?',
          required: true,
          choices: [
            { id: 'c1', label: 'Technology', value: 'technology' },
            { id: 'c2', label: 'Business', value: 'business' },
            { id: 'c3', label: 'Marketing', value: 'marketing' },
            { id: 'c4', label: 'Design', value: 'design' },
          ],
        },
        {
          id: 'q6',
          type: 'longText',
          title: 'Do you have any dietary restrictions?',
          required: false,
          properties: {
            placeholder: 'Please specify any dietary restrictions...',
          },
        },
      ],
      settings: {
        showProgressBar: true,
        submitButtonText: 'Complete Registration',
        successMessage: 'You have successfully registered for the event!',
        allowMultipleSubmissions: false,
      },
    },
  },
];

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider = ({ children }: FormProviderProps) => {
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>(initialTemplates);
  const [activeQuestion, setActiveQuestion] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedForms = localStorage.getItem('forms');
    const savedResponses = localStorage.getItem('responses');
    
    if (savedForms) {
      try {
        const parsedForms = JSON.parse(savedForms);
        // Convert string dates back to Date objects
        const hydratedForms = parsedForms.map((form: any) => ({
          ...form,
          createdAt: new Date(form.createdAt),
          updatedAt: new Date(form.updatedAt)
        }));
        setForms(hydratedForms);
      } catch (error) {
        console.error('Failed to parse saved forms:', error);
      }
    }
    
    if (savedResponses) {
      try {
        const parsedResponses = JSON.parse(savedResponses);
        // Convert string dates back to Date objects
        const hydratedResponses = parsedResponses.map((response: any) => ({
          ...response,
          metadata: {
            ...response.metadata,
            startedAt: new Date(response.metadata.startedAt),
            completedAt: new Date(response.metadata.completedAt)
          }
        }));
        setResponses(hydratedResponses);
      } catch (error) {
        console.error('Failed to parse saved responses:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('forms', JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem('responses', JSON.stringify(responses));
  }, [responses]);

  // Form CRUD operations
  const createForm = (formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newForm: Form = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setForms(prev => [...prev, newForm]);
    return newForm;
  };

  const getForm = (id: string) => {
    return forms.find(form => form.id === id) || null;
  };

  const updateForm = (id: string, updates: Partial<Form>) => {
    const formIndex = forms.findIndex(form => form.id === id);
    
    if (formIndex === -1) return null;
    
    const updatedForm = {
      ...forms[formIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    const newForms = [...forms];
    newForms[formIndex] = updatedForm;
    
    setForms(newForms);
    return updatedForm;
  };

  const deleteForm = (id: string) => {
    const formIndex = forms.findIndex(form => form.id === id);
    
    if (formIndex === -1) return false;
    
    const newForms = [...forms];
    newForms.splice(formIndex, 1);
    
    setForms(newForms);
    return true;
  };

  // Question operations
  const addQuestion = (formId: string, question: Omit<Question, 'id'>) => {
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex === -1) return null;
    
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID()
    };
    
    const newForms = [...forms];
    newForms[formIndex] = {
      ...newForms[formIndex],
      questions: [...newForms[formIndex].questions, newQuestion],
      updatedAt: new Date()
    };
    
    setForms(newForms);
    return newQuestion;
  };

  const updateQuestion = (formId: string, questionId: string, updates: Partial<Question>) => {
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex === -1) return null;
    
    const questionIndex = forms[formIndex].questions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) return null;
    
    const newForms = [...forms];
    const updatedQuestion = {
      ...newForms[formIndex].questions[questionIndex],
      ...updates
    };
    
    newForms[formIndex].questions[questionIndex] = updatedQuestion;
    newForms[formIndex].updatedAt = new Date();
    
    setForms(newForms);
    return updatedQuestion;
  };

  const reorderQuestions = (formId: string, newOrder: string[]) => {
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex === -1) return false;
    
    const form = forms[formIndex];
    const questionsMap = new Map(form.questions.map(q => [q.id, q]));
    
    const reorderedQuestions = newOrder
      .map(id => questionsMap.get(id))
      .filter((q): q is Question => q !== undefined);
    
    if (reorderedQuestions.length !== form.questions.length) return false;
    
    const newForms = [...forms];
    newForms[formIndex] = {
      ...form,
      questions: reorderedQuestions,
      updatedAt: new Date()
    };
    
    setForms(newForms);
    return true;
  };

  const deleteQuestion = (formId: string, questionId: string) => {
    const formIndex = forms.findIndex(form => form.id === formId);
    
    if (formIndex === -1) return false;
    
    const form = forms[formIndex];
    const newQuestions = form.questions.filter(q => q.id !== questionId);
    
    if (newQuestions.length === form.questions.length) return false;
    
    const newForms = [...forms];
    newForms[formIndex] = {
      ...form,
      questions: newQuestions,
      updatedAt: new Date()
    };
    
    setForms(newForms);
    return true;
  };

  // Form submission
  const submitResponse = (responseData: Omit<FormResponse, 'id'>) => {
    const newResponse: FormResponse = {
      ...responseData,
      id: crypto.randomUUID()
    };
    
    setResponses(prev => [...prev, newResponse]);
    return newResponse;
  };

  const getResponses = (formId: string) => {
    return responses.filter(response => response.formId === formId);
  };

  // Template operations
  const createFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return null;
    
    return createForm({
      ...template.form,
      questions: template.form.questions.map(q => ({
        ...q,
        id: crypto.randomUUID()
      }))
    });
  };

  // Form viewing navigation functions
  const nextQuestion = () => {
    if (!currentForm) return;
    if (activeQuestion < currentForm.questions.length - 1) {
      setActiveQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(prev => prev - 1);
    }
  };

  const value = {
    forms,
    currentForm,
    responses,
    templates,
    activeQuestion,
    
    createForm,
    getForm,
    updateForm,
    deleteForm,
    
    addQuestion,
    updateQuestion,
    reorderQuestions,
    deleteQuestion,
    
    submitResponse,
    getResponses,
    
    createFromTemplate,
    
    setActiveQuestion,
    nextQuestion,
    previousQuestion
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  
  return context;
};