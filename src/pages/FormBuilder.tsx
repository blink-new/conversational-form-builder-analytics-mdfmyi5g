import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Settings, 
  Eye, 
  Trash2, 
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'; // Not used currently
import { useForm } from '../context/FormContext';
import { Form, Question, QuestionType, Choice } from '../types/form'; // Added Choice

const questionTypes: { type: QuestionType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Short Text', icon: <span className="text-lg">Aa</span> },
  { type: 'longText', label: 'Paragraph', icon: <span className="text-lg">¶</span> },
  { type: 'singleChoice', label: 'Multiple Choice', icon: <span className="text-lg">◯</span> },
  { type: 'multipleChoice', label: 'Checkboxes', icon: <span className="text-lg">☑</span> },
  { type: 'email', label: 'Email', icon: <span className="text-lg">@</span> },
  { type: 'number', label: 'Number', icon: <span className="text-lg">123</span> },
  { type: 'date', label: 'Date', icon: <span className="text-lg">📅</span> },
  { type: 'rating', label: 'Rating', icon: <span className="text-lg">★</span> },
  { type: 'boolean', label: 'Yes/No', icon: <span className="text-lg">Y/N</span> },
  { type: 'phone', label: 'Phone', icon: <span className="text-lg">📞</span> },
  { type: 'url', label: 'Website', icon: <span className="text-lg">🔗</span> },
  // { type: 'fileUpload', label: 'File Upload', icon: <span className="text-lg">📁</span> }, // Not fully implemented yet
];

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { 
    getForm, 
    createForm, 
    updateForm, 
    addQuestion: addQuestionToContext, 
    updateQuestion: updateQuestionInContext,
    deleteQuestion: deleteQuestionFromContext,
  } = useForm();
  
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  // const [isDragging, setIsDragging] = useState(false); // Not used currently

  useEffect(() => {
    if (formId && formId !== 'new') {
      const existingForm = getForm(formId);
      if (existingForm) {
        setForm(existingForm);
        setTitle(existingForm.title || '');
        setDescription(existingForm.description || '');
        if (existingForm.questions.length > 0 && selectedQuestionIndex === null) {
          setSelectedQuestionIndex(0);
        }
      } else {
        navigate('/builder/new', { replace: true });
      }
    } else if (formId === 'new') {
      const newFormInstance = createForm({
        title: 'Untitled Form',
        description: '',
        questions: [],
        settings: {
          showProgressBar: true,
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          allowMultipleSubmissions: true,
        },
      });
      setForm(newFormInstance);
      setTitle(newFormInstance.title);
      setDescription(newFormInstance.description);
      navigate(`/builder/${newFormInstance.id}`, { replace: true });
    } else if (!formId) {
      navigate('/builder/new', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId, getForm, createForm, navigate]); // Removed selectedQuestionIndex from deps to avoid loop

  const handleFormMetaChange = (field: 'title' | 'description', value: string) => {
    if (!form) return;
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    updateForm(form.id, { ...form, title, description, [field]: value });
  };

  const handleAddQuestion = (type: QuestionType = 'text') => {
    if (!form) return;
    
    const newQuestionData: Omit<Question, 'id'> = {
      type,
      title: `New ${type.replace(/([A-Z])/g, ' $1').trim()} Question`,
      required: false,
      choices: (type === 'singleChoice' || type === 'multipleChoice') 
        ? [{id: crypto.randomUUID(), label: 'Option 1', value: 'option_1'}] 
        : undefined,
    };
    
    const updatedQuestion = addQuestionToContext(form.id, newQuestionData);
    if (updatedQuestion) {
      const updatedForm = getForm(form.id);
      if (updatedForm) {
        setForm(updatedForm);
        setSelectedQuestionIndex(updatedForm.questions.length - 1);
      }
    }
  };

  const handleQuestionDetailChange = (key: keyof Question, value: any) => {
    if (form && selectedQuestionIndex !== null && form.questions[selectedQuestionIndex]) {
      const questionId = form.questions[selectedQuestionIndex].id;
      const updatedQuestion = updateQuestionInContext(form.id, questionId, { [key]: value });
      if (updatedQuestion) {
        const updatedForm = getForm(form.id);
        if (updatedForm) setForm(updatedForm);
      }
    }
  };

  const handleChoiceChange = (choiceId: string, newLabel: string) => {
    if (form && selectedQuestionIndex !== null) {
      const question = form.questions[selectedQuestionIndex];
      if (question && question.choices) {
        const updatedChoices = question.choices.map(c => 
          c.id === choiceId ? { ...c, label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, '_') } : c
        );
        handleQuestionDetailChange('choices', updatedChoices);
      }
    }
  };

  const handleAddChoice = () => {
    if (form && selectedQuestionIndex !== null) {
      const question = form.questions[selectedQuestionIndex];
      if (question && (question.type === 'singleChoice' || question.type === 'multipleChoice')) {
        const newChoice: Choice = {
          id: crypto.randomUUID(),
          label: `Option ${(question.choices?.length || 0) + 1}`,
          value: `option_${(question.choices?.length || 0) + 1}`
        };
        const updatedChoices = [...(question.choices || []), newChoice];
        handleQuestionDetailChange('choices', updatedChoices);
      }
    }
  };

  const handleRemoveChoice = (choiceId: string) => {
    if (form && selectedQuestionIndex !== null) {
      const question = form.questions[selectedQuestionIndex];
      if (question && question.choices) {
        const updatedChoices = question.choices.filter(c => c.id !== choiceId);
        handleQuestionDetailChange('choices', updatedChoices);
      }
    }
  };

  const handleDeleteQuestion = () => {
    if (form && selectedQuestionIndex !== null && form.questions[selectedQuestionIndex]) {
      const questionId = form.questions[selectedQuestionIndex].id;
      deleteQuestionFromContext(form.id, questionId);
      const updatedForm = getForm(form.id);
      if (updatedForm) {
        setForm(updatedForm);
        setSelectedQuestionIndex(updatedForm.questions.length > 0 ? Math.max(0, selectedQuestionIndex -1) : null);
      }
    }
  };

  const handleSaveForm = () => {
    if (!form) return;
    updateForm(form.id, { ...form, title, description });
    // Add toast notification for save
  };

  if (!form) return <div className="p-4 text-center">Loading form data...</div>;
  
  const currentQuestion = (selectedQuestionIndex !== null && form.questions && form.questions[selectedQuestionIndex]) 
    ? form.questions[selectedQuestionIndex] 
    : null;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => handleFormMetaChange('title', e.target.value)}
              placeholder="Untitled Form"
              className="text-xl font-medium border-none shadow-none px-0 focus-visible:ring-0 h-auto py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/form/${form.id}`)} target="_blank">
              <Eye className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveForm} className="bg-teal hover:bg-teal/90 text-white">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full py-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-4 flex flex-col h-full gap-4">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium text-midnight">Questions</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleAddQuestion()}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="p-2 flex-1 overflow-y-auto">
                  {form.questions && form.questions.length > 0 ? (
                    <div className="space-y-1">
                      {form.questions.map((question, index) => (
                        <div 
                          key={question.id}
                          className={`p-3 rounded-md border cursor-pointer transition-all ${
                            selectedQuestionIndex === index 
                              ? 'bg-teal/10 border-teal text-teal' 
                              : 'bg-white border-transparent hover:bg-slate-100'
                          }`}
                          onClick={() => setSelectedQuestionIndex(index)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`flex-shrink-0 ${selectedQuestionIndex === index ? 'text-teal' : 'text-slate-500'}`}>
                              {questionTypes.find(qt => qt.type === question.type)?.icon || 'Aa'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${selectedQuestionIndex === index ? 'text-teal' : 'text-midnight'}`}>
                                {question.title || 'Untitled Question'}
                              </p>
                              <p className={`text-xs ${selectedQuestionIndex === index ? 'text-teal/80' : 'text-slate-500'}`}>
                                {questionTypes.find(qt => qt.type === question.type)?.label || 'Text'}
                                {question.required && ' • Required'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <p className="text-slate-500 mb-3">No questions yet.</p>
                      <Button variant="outline" size="sm" onClick={() => handleAddQuestion()}>
                        <Plus className="h-4 w-4 mr-2" /> Add your first question
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card>
                <div className="p-4">
                  <Label htmlFor="form-description" className="text-sm font-medium text-midnight">Form Description</Label>
                  <Textarea
                    id="form-description"
                    value={description}
                    onChange={(e) => handleFormMetaChange('description', e.target.value)}
                    placeholder="(Optional) Add a description for your form"
                    className="mt-1 resize-none text-sm"
                    rows={3}
                  />
                </div>
              </Card>
            </div>
            
            <div className="col-span-8 h-full">
              <div className="bg-white rounded-xl shadow-md h-full overflow-hidden flex flex-col">
                {currentQuestion ? (
                  <Tabs defaultValue="properties" className="flex flex-col h-full">
                    <div className="px-6 pt-6 border-b">
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                        <TabsTrigger value="logic">Logic</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                      <TabsContent value="properties" className="m-0">
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="question-title">Question Title</Label>
                            <Input 
                              id="question-title" 
                              value={currentQuestion.title || ''} 
                              onChange={(e) => handleQuestionDetailChange('title', e.target.value)}
                              placeholder="Enter question title" 
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="question-description">Description (Optional)</Label>
                            <Textarea 
                              id="question-description" 
                              value={currentQuestion.description || ''} 
                              onChange={(e) => handleQuestionDetailChange('description', e.target.value)}
                              placeholder="Add description" 
                              className="mt-1 resize-none" 
                              rows={2}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="required-switch">Required</Label>
                            <Switch 
                              id="required-switch" 
                              checked={currentQuestion.required || false} 
                              onCheckedChange={(checked) => handleQuestionDetailChange('required', checked)}
                            />
                          </div>
                          
                          {(currentQuestion.type === 'singleChoice' || currentQuestion.type === 'multipleChoice') && (
                            <div>
                              <Label className="mb-2 block">Options</Label>
                              <div className="space-y-2">
                                {currentQuestion.choices?.map((choice, cIndex) => (
                                  <div key={choice.id} className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                                    <Input 
                                      value={choice.label} 
                                      onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                                      className="flex-1" 
                                      placeholder={`Option ${cIndex + 1}`}
                                    />
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                                      onClick={() => handleRemoveChoice(choice.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button 
                                  variant="outline" 
                                  className="w-full mt-2 border-dashed"
                                  onClick={handleAddChoice}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="validation" className="m-0">
                        <p className="text-sm text-slate-500">
                          Configure validation rules for this question.
                        </p>
                        
                        {['text', 'longText'].includes(currentQuestion.type || '') && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label htmlFor="max-length">Maximum Length</Label>
                              <Input 
                                id="max-length" 
                                type="number" 
                                placeholder="No limit"
                                className="mt-1" 
                                value={currentQuestion.properties?.maxLength || ''}
                                onChange={(e) => handleQuestionDetailChange('properties', { ...currentQuestion.properties, maxLength: parseInt(e.target.value) || undefined })}
                              />
                            </div>
                          </div>
                        )}
                        
                        {currentQuestion.type === 'number' && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label htmlFor="min-value">Minimum Value</Label>
                              <Input 
                                id="min-value" 
                                type="number" 
                                placeholder="No minimum"
                                className="mt-1" 
                                value={currentQuestion.validation?.min || ''}
                                onChange={(e) => handleQuestionDetailChange('validation', { ...currentQuestion.validation, min: parseInt(e.target.value) || undefined })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="max-value">Maximum Value</Label>
                              <Input 
                                id="max-value" 
                                type="number" 
                                placeholder="No maximum"
                                className="mt-1" 
                                value={currentQuestion.validation?.max || ''}
                                onChange={(e) => handleQuestionDetailChange('validation', { ...currentQuestion.validation, max: parseInt(e.target.value) || undefined })}
                              />
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="logic" className="m-0">
                        <p className="text-sm text-slate-500">
                          Configure conditional logic for this question.
                        </p>
                        <div className="mt-6 border border-dashed border-slate-300 rounded-lg p-4 text-center">
                          <p className="text-slate-500">Advanced logic coming soon!</p>
                        </div>
                      </TabsContent>
                    </div>
                    
                    <div className="p-4 border-t mt-auto">
                      <div className="flex justify-between">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDeleteQuestion}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Question
                        </Button>
                        <div className="flex items-center gap-2">
                          {selectedQuestionIndex > 0 && (
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                          )}
                          {selectedQuestionIndex < (form.questions.length - 1) && (
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Tabs>
                ) : (
                  <div className="p-6 h-full flex flex-col items-center justify-center">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-medium text-midnight mb-2">No question selected</h3>
                      <p className="text-slate-500 mb-4">
                        Select a question from the list on the left, or add a new one to get started.
                      </p>
                      <Button onClick={() => handleAddQuestion()} className="bg-teal hover:bg-teal/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;