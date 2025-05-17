import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
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
  const navigate = useNavigate();
  const { getForm, submitResponse } = useForm();

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      if (formData) {
        setForm(formData);
        setActiveQuestionIndex(0);
      }
    }
  }, [formId, getForm]);

  const handleExitPreview = () => {
    if (formId) {
      navigate(`/builder/${formId}`);
    } else {
      navigate('/');
    }
  };

  const nextQuestion = () => {
    if (form && activeQuestionIndex < form.questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    }
  };

  if (!form) {
    return (
      <div className="form-container">
        <div className="question-card text-center">
          <h2 className="text-2xl font-semibold text-midnight mb-4">Form Not Found</h2>
          <p className="text-slate-600 mb-6">The form you're looking for doesn't exist or has been deleted.</p>
          <Link to="/">
            <Button className="bg-teal hover:bg-teal/90 text-white">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = form.questions[activeQuestionIndex];
  const progress = ((activeQuestionIndex + 1) / form.questions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
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
    if (form && activeQuestionIndex < form.questions.length - 1) {
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
      },
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
            onChange={e => handleAnswer(question.id, e.target.value)}
            className="w-full text-lg"
          />
        );
      case 'longText':
        return (
          <Textarea
            placeholder={question.properties?.placeholder || ''}
            value={value || ''}
            onChange={e => handleAnswer(question.id, e.target.value)}
            className="w-full text-lg resize-none"
            rows={5}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            placeholder={question.properties?.placeholder || 'your@email.com'}
            value={value || ''}
            onChange={e => handleAnswer(question.id, e.target.value)}
            className="w-full text-lg"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder={question.properties?.placeholder || ''}
            value={value || ''}
            onChange={e => handleAnswer(question.id, e.target.value)}
            className="w-full text-lg"
          />
        );
      case 'singleChoice':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={v => handleAnswer(question.id, v)}
            className="mt-6 space-y-4"
          >
            {question.choices?.map(choice => (
              <div key={choice.id} className="flex items-center space-x-3">
                <RadioGroupItem value={choice.value} id={choice.id} />
                <label htmlFor={choice.id} className="text-lg font-medium cursor-pointer">
                  {choice.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'multipleChoice':
        return (
          <div className="mt-6 space-y-4">
            {question.choices?.map(choice => {
              const isChecked = Array.isArray(value) ? value.includes(choice.value) : false;
              return (
                <div key={choice.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={choice.id}
                    checked={isChecked}
                    onCheckedChange={checked => {
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
                  <label htmlFor={choice.id} className="text-lg font-medium cursor-pointer">
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
            onChange={e => handleAnswer(question.id, e.target.value)}
            className="w-full text-lg"
          />
        );
    }
  };

  if (isSubmitted) {
    return (
      <div className="form-container max-w-md mx-auto p-8 rounded-lg shadow-lg bg-white text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitPreview}
          className="absolute top-4 right-4"
        >
          <X className="h-6 w-6" />
          Exit Preview
        </Button>
        <div className="mb-6">
          <Check className="mx-auto h-16 w-16 text-teal" />
          <h2 className="mt-4 text-2xl font-semibold text-midnight">
            {form.settings?.successMessage || 'Thank you for your submission!'}
          </h2>
          <p className="mt-2 text-slate-600">Your response has been recorded.</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleExitPreview}
            variant="outline"
            className="text-slate-600"
          >
            Exit Preview
          </Button>
          <Button
            onClick={() => {
              setIsSubmitted(false);
              setActiveQuestionIndex(0);
              setAnswers({});
            }}
            className="bg-teal hover:bg-teal/90 text-white"
          >
            Start Again
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="form-container max-w-md mx-auto p-8 rounded-lg shadow-lg bg-white text-center">
        <p className="text-slate-600">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="form-container max-w-md mx-auto p-8 rounded-lg shadow-lg bg-white">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExitPreview}
        className="absolute top-4 right-4"
      >
        <X className="h-6 w-6" />
        Exit Preview
      </Button>

      {form.settings?.showProgressBar && form.questions.length > 0 && (
        <Progress value={progress} className="h-2 rounded-full mb-6" style={{ backgroundColor: '#FDE047' }} />
      )}

      <h1 className="text-3xl font-semibold text-midnight mb-4">{form.title || 'Form Title'}</h1>
      {form.description && <p className="text-slate-600 mb-8">{form.description}</p>}

      <div key={currentQuestion.id} className="mb-8">
        <h2 className="text-xl font-semibold text-midnight mb-2">
          {currentQuestion.title}
          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {currentQuestion.description && <p className="text-slate-600 mb-6">{currentQuestion.description}</p>}

        {renderQuestionInput(currentQuestion)}
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={previousQuestion}
          disabled={activeQuestionIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="bg-teal hover:bg-teal/90 text-white flex items-center gap-2"
        >
          {activeQuestionIndex < form.questions.length - 1 ? (
            <>
              Next
              <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            form.settings?.submitButtonText || 'Submit'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormView;
