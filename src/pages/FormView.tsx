import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { useForm } from '../context/FormContext';
import { Form, Question, FormResponse } from '../types/form';

const FormView = () => {
  const { formId } = useParams();
  const { getForm, submitResponse, activeQuestion, setActiveQuestion, nextQuestion, previousQuestion } = useForm();
  
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<Date>(new Date());

  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      if (formData) {
        setForm(formData);
        setActiveQuestion(0);
      }
    }
  }, [formId, getForm, setActiveQuestion]);

  if (!form) {
    return (
      <div className="form-container">
        <div className="question-card text-center">
          <h2 className="text-xl font-heading text-midnight mb-4">Form Not Found</h2>
          <p className="text-slate mb-6">The form you're looking for doesn't exist or has been deleted.</p>
          <Link to="/">
            <Button className="bg-teal hover:bg-teal/90 text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Ensure currentQuestion is defined before accessing its properties
  const currentQuestion = form.questions && form.questions[activeQuestion] ? form.questions[activeQuestion] : null;
  const progress = form.questions.length > 0 ? ((activeQuestion + 1) / form.questions.length) * 100 : 0;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    
    const answer = answers[currentQuestion.id];
    if (answer === undefined || answer === '') return false;
    if (Array.isArray(answer) && answer.length === 0) return false;
    
    return true;
  };

  const handleNext = () => {
    if (activeQuestion < form.questions.length - 1) {
      nextQuestion();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    
    const responseData: Omit<FormResponse, 'id'> = {
      formId: form.id,
      answers,
      metadata: {
        startedAt: startTime,
        completedAt: new Date(),
        userAgent: navigator.userAgent,
      }
    };
    
    submitResponse(responseData);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const renderQuestionInput = (question: Question) => {
    const value = answers[question.id];
    
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder={question.properties?.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full"
          />
        );
      
      case 'longText':
        return (
          <Textarea
            placeholder={question.properties?.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full resize-none"
            rows={5}
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            placeholder={question.properties?.placeholder || 'your@email.com'}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={question.properties?.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full"
          />
        );
      
      case 'singleChoice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(newValue) => handleAnswer(question.id, newValue)}
            className="space-y-3"
          >
            {question.choices?.map((choice) => (
              <div key={choice.id} className="flex items-center space-x-2">
                <RadioGroupItem value={choice.value} id={choice.id} />
                <label htmlFor={choice.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {choice.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'multipleChoice':
        return (
          <div className="space-y-3">
            {question.choices?.map((choice) => {
              const isChecked = Array.isArray(value) 
                ? value.includes(choice.value) 
                : false;
              
              return (
                <div key={choice.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={choice.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (checked) {
                        if (!newValue.includes(choice.value)) {
                          newValue.push(choice.value);
                        }
                      } else {
                        const index = newValue.indexOf(choice.value);
                        if (index !== -1) {
                          newValue.splice(index, 1);
                        }
                      }
                      handleAnswer(question.id, newValue);
                    }}
                  />
                  <label htmlFor={choice.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {choice.label}
                  </label>
                </div>
              );
            })}
          </div>
        );
      
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="form-container">
        <div className="question-card text-center">
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-teal" />
          </div>
          <h2 className="text-2xl font-heading font-semibold text-midnight mb-4">
            {form.settings?.successMessage || 'Thank you for your submission!'}
          </h2>
          <p className="text-slate mb-8">
            Your response has been recorded.
          </p>
          <Link to="/">
            <Button className="bg-teal hover:bg-teal/90 text-white">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Add a loading state or return null if currentQuestion is not ready
  if (!currentQuestion) {
     return (
        <div className="form-container">
            <div className="question-card text-center">
                <p className="text-slate">Loading question...</p>
            </div>
        </div>
     );
  }

  return (
    <div className="form-container">
      {form.settings?.showProgressBar && form.questions.length > 0 && (
        <div className="max-w-xl w-full mx-auto mb-6">
          <div className="flex justify-between text-sm text-slate mb-2">
            <span>Question {activeQuestion + 1} of {form.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="question-card animation-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-midnight mb-2">{form.title || 'Form Title'}</h1>
          <p className="text-slate">{form.description || ''}</p>
        </div>
        
        <div key={currentQuestion.id} className="mb-8 animation-slide-in-right">
          <h2 className="text-xl font-heading font-semibold text-midnight mb-2">
            {currentQuestion.title}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
          {currentQuestion?.description && (
            <p className="text-slate mb-4">{currentQuestion.description}</p>
          )}
          
          {currentQuestion && (
            <div className="mt-6">
              {renderQuestionInput(currentQuestion)}
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={previousQuestion}
            disabled={activeQuestion === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-teal hover:bg-teal/90 text-white flex items-center gap-2"
          >
            {activeQuestion < (form.questions?.length || 0) - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              form.settings?.submitButtonText || 'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormView;