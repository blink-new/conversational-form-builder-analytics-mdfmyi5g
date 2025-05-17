import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { useForm } from '../context/FormContext';
import { Form, Question, FormResponse } from '../types/form';

const FormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { getForm, submitResponse } = useForm();
  
  const [form, setForm] = useState<Form | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [prevQuestion, setPrevQuestion] = useState<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Animation variants
  const variants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
      rotateY: direction === 'forward' ? 20 : -20,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        rotateY: { duration: 0.3 }
      }
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
      rotateY: direction === 'forward' ? -90 : 90,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        rotateY: { duration: 0.3 }
      }
    })
  };

  // Paper fold animation
  const foldAnimation = {
    initial: { rotateY: 0, opacity: 1 },
    fold: { 
      rotateY: -90, 
      opacity: 0,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
    }
  };

  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      if (formData) {
        setForm(formData);
        
        // Initialize answers object
        const initialAnswers: Record<string, any> = {};
        formData.questions.forEach(q => {
          initialAnswers[q.id] = q.type === 'multipleChoice' ? [] : '';
        });
        setAnswers(initialAnswers);
      } else {
        navigate('/');
      }
    }
  }, [formId, getForm, navigate]);

  const handleNextQuestion = () => {
    if (!form) return;
    
    const currentQuestion = form.questions[currentQuestionIndex];
    
    // Validate if required
    if (
      currentQuestion.required && 
      (answers[currentQuestion.id] === '' || 
       (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0))
    ) {
      // Show validation error
      return;
    }
    
    setPrevQuestion(currentQuestionIndex);
    setDirection('forward');
    
    if (currentQuestionIndex < form.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setPrevQuestion(currentQuestionIndex);
      setDirection('backward');
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    setIsSubmitting(true);
    
    try {
      const response: Omit<FormResponse, 'id'> = {
        formId: form.id,
        answers,
        metadata: {
          startedAt: startTime,
          completedAt: new Date(),
        }
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      submitResponse(response);
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentValues = [...(prev[questionId] || [])];
      
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter(v => v !== value)
        };
      }
    });
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.properties?.placeholder}
            className="w-full mt-2"
          />
        );
      
      case 'longText':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.properties?.placeholder}
            className="w-full mt-2 min-h-[100px]"
          />
        );
      
      case 'email':
        return (
          <Input
            type="email"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.properties?.placeholder || 'example@email.com'}
            className="w-full mt-2"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder={question.properties?.placeholder}
            className="w-full mt-2"
          />
        );
      
      case 'singleChoice':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
            className="mt-4 space-y-3"
          >
            {question.choices?.map((choice) => (
              <div key={choice.id} className="flex items-center space-x-2">
                <RadioGroupItem value={choice.value} id={choice.id} />
                <Label htmlFor={choice.id} className="cursor-pointer">{choice.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'multipleChoice':
        return (
          <div className="mt-4 space-y-3">
            {question.choices?.map((choice) => (
              <div key={choice.id} className="flex items-center space-x-2">
                <Checkbox
                  id={choice.id}
                  checked={(answers[question.id] || []).includes(choice.value)}
                  onCheckedChange={(checked) => handleCheckboxChange(question.id, choice.value, checked as boolean)}
                />
                <Label htmlFor={choice.id} className="cursor-pointer">{choice.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full mt-2"
          />
        );
      
      case 'boolean':
        return (
          <div className="mt-4 space-x-4 flex">
            <Button
              type="button"
              variant={answers[question.id] === true ? "default" : "outline"}
              onClick={() => handleInputChange(question.id, true)}
              className={answers[question.id] === true ? "bg-teal hover:bg-teal/90 text-white" : ""}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={answers[question.id] === false ? "default" : "outline"}
              onClick={() => handleInputChange(question.id, false)}
              className={answers[question.id] === false ? "bg-teal hover:bg-teal/90 text-white" : ""}
            >
              No
            </Button>
          </div>
        );
      
      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (!form) {
    return (
      <div className="form-container">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal" />
          <p className="mt-2 text-slate">Loading form...</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="form-container">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="question-card text-center"
        >
          <div className="mx-auto w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-semibold text-midnight mb-4">
            {form.settings.successMessage || 'Thank you for your submission!'}
          </h2>
          <p className="text-slate mb-8">Your response has been recorded.</p>
          
          {form.settings.allowMultipleSubmissions && (
            <Button 
              className="bg-teal hover:bg-teal/90 text-white"
              onClick={() => {
                setCurrentQuestionIndex(0);
                const initialAnswers: Record<string, any> = {};
                form.questions.forEach(q => {
                  initialAnswers[q.id] = q.type === 'multipleChoice' ? [] : '';
                });
                setAnswers(initialAnswers);
                setIsComplete(false);
              }}
            >
              Submit Another Response
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / form.questions.length) * 100;
  const currentQuestion = form.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === form.questions.length - 1;

  return (
    <div className="form-container">
      <div className="w-full max-w-2xl flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-midnight mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-slate">{form.description}</p>
          )}
        </div>
        
        {form.settings.showProgressBar && (
          <div className="mb-8 w-full">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-slate">
              <span>Question {currentQuestionIndex + 1} of {form.questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        )}
        
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentQuestionIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="question-card"
          >
            <div className="mb-4">
              <h2 className="text-xl font-heading font-medium text-midnight mb-1">
                {currentQuestion.title}
                {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              {currentQuestion.description && (
                <p className="text-slate text-sm">{currentQuestion.description}</p>
              )}
            </div>
            
            {renderQuestionInput(currentQuestion)}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={currentQuestionIndex === 0 ? 'invisible' : ''}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button
                type="button"
                className="bg-teal hover:bg-teal/90 text-white ml-auto"
                onClick={isLastQuestion ? handleSubmit : handleNextQuestion}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : isLastQuestion ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FormView;