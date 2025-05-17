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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { useForm } from '../context/FormContext';
import { Form, Question, QuestionType } from '../types/form';

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
  { type: 'fileUpload', label: 'File Upload', icon: <span className="text-lg">📁</span> },
];

const FormBuilder = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { forms, getForm, createForm, updateForm, addQuestion } = useForm();
  
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (formId && formId !== 'new') {
      const existingForm = getForm(formId);
      if (existingForm) {
        setForm(existingForm);
        setTitle(existingForm.title);
        setDescription(existingForm.description);
      } else {
        navigate('/builder/new');
      }
    } else {
      // Create a new form with default settings
      const newForm = createForm({
        title: 'Untitled Form',
        description: '',
        questions: [],
        settings: {
          showProgressBar: true,
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!',
          allowMultipleSubmissions: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setForm(newForm);
      navigate(`/builder/${newForm.id}`, { replace: true });
    }
  }, [formId, getForm, createForm, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (form) {
      updateForm(form.id, { title: e.target.value });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (form) {
      updateForm(form.id, { description: e.target.value });
    }
  };

  const handleAddQuestion = (type: QuestionType) => {
    if (!form) return;
    
    const newQuestion = addQuestion(form.id, {
      type,
      title: 'Question title',
      required: false,
      choices: type === 'singleChoice' || type === 'multipleChoice' ? [
        { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
        { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
      ] : undefined,
    });
    
    if (newQuestion) {
      const updatedForm = getForm(form.id);
      if (updatedForm) {
        setForm(updatedForm);
        setSelectedQuestionIndex(updatedForm.questions.length - 1);
      }
    }
  };

  if (!form) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-full mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-midnight">Form Builder</h1>
          <p className="text-slate">Create and customize your form</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Form Settings</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Preview</span>
          </Button>
          <Button className="bg-teal hover:bg-teal/90 text-white flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden md:inline">Save</span>
          </Button>
        </div>
      </div>
      
      <div className="form-builder-container">
        {/* Left panel: Form editor */}
        <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col overflow-hidden">
          <div className="mb-6">
            <Input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-xl font-heading font-semibold mb-3 border-transparent hover:border-input focus:border-input"
              placeholder="Form Title"
            />
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              className="resize-none border-transparent hover:border-input focus:border-input"
              placeholder="Form Description"
              rows={2}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {form.questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <h3 className="text-lg font-medium text-midnight mb-2">No questions yet</h3>
                <p className="text-slate mb-6">Add a question to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {form.questions.map((question, index) => (
                  <Card 
                    key={question.id} 
                    className={`border ${
                      selectedQuestionIndex === index ? 'border-teal ring-1 ring-teal' : 'border-border'
                    }`}
                    onClick={() => setSelectedQuestionIndex(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 cursor-move" onMouseDown={() => setIsDragging(true)}>
                          <GripVertical className="h-5 w-5 text-slate" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-medium">
                              {question.title || 'Untitled Question'}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <div className="text-xs px-2 py-1 bg-slate/10 rounded text-slate">
                              {questionTypes.find(q => q.type === question.type)?.label || 'Unknown'}
                            </div>
                          </div>
                          {question.description && (
                            <div className="text-sm text-slate mb-2">{question.description}</div>
                          )}
                          
                          {/* Question preview based on type */}
                          {question.type === 'text' && (
                            <div className="bg-slate/5 border border-slate/20 rounded px-3 py-2 text-sm text-slate/60">
                              {question.properties?.placeholder || 'Short text answer'}
                            </div>
                          )}
                          
                          {question.type === 'longText' && (
                            <div className="bg-slate/5 border border-slate/20 rounded px-3 py-2 text-sm text-slate/60 h-20">
                              {question.properties?.placeholder || 'Long text answer'}
                            </div>
                          )}
                          
                          {(question.type === 'singleChoice' || question.type === 'multipleChoice') && (
                            <div className="space-y-1">
                              {question.choices?.map(choice => (
                                <div key={choice.id} className="flex items-center gap-2">
                                  {question.type === 'singleChoice' ? (
                                    <div className="w-4 h-4 rounded-full border border-slate/40"></div>
                                  ) : (
                                    <div className="w-4 h-4 rounded border border-slate/40"></div>
                                  )}
                                  <div className="text-sm">{choice.label}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 mt-auto">
            <Button className="w-full" onClick={() => handleAddQuestion('text')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>
        
        {/* Right panel: Question settings or question type selection */}
        <div className="bg-white rounded-xl shadow-md h-full overflow-hidden flex flex-col">
          {selectedQuestionIndex !== null ? (
            <Tabs defaultValue="properties" className="flex flex-col h-full">
              <div className="px-4 pt-4 border-b">
                <TabsList className="grid grid-cols-3 mb-0">
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
                        value={form.questions[selectedQuestionIndex].title} 
                        placeholder="Enter question title" 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="question-description">Description (Optional)</Label>
                      <Textarea 
                        id="question-description" 
                        value={form.questions[selectedQuestionIndex].description || ''} 
                        placeholder="Add description" 
                        className="mt-1 resize-none" 
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="required-switch">Required</Label>
                      <Switch 
                        id="required-switch" 
                        checked={form.questions[selectedQuestionIndex].required} 
                      />
                    </div>
                    
                    {(form.questions[selectedQuestionIndex].type === 'singleChoice' || 
                      form.questions[selectedQuestionIndex].type === 'multipleChoice') && (
                      <div>
                        <Label className="mb-2 block">Options</Label>
                        <div className="space-y-2">
                          {form.questions[selectedQuestionIndex].choices?.map((choice, cIndex) => (
                            <div key={choice.id} className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-slate/60 cursor-move" />
                              <Input 
                                value={choice.label} 
                                className="flex-1" 
                                placeholder={`Option ${cIndex + 1}`}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate/60 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            className="w-full mt-2 border-dashed"
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
                  <p className="text-sm text-slate">
                    Configure validation rules for this question.
                  </p>
                  
                  {/* Validation settings will depend on the question type */}
                  {['text', 'longText'].includes(form.questions[selectedQuestionIndex].type) && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="max-length">Maximum Length</Label>
                        <Input 
                          id="max-length" 
                          type="number" 
                          placeholder="No limit"
                          className="mt-1" 
                        />
                      </div>
                    </div>
                  )}
                  
                  {form.questions[selectedQuestionIndex].type === 'number' && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="min-value">Minimum Value</Label>
                        <Input 
                          id="min-value" 
                          type="number" 
                          placeholder="No minimum"
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-value">Maximum Value</Label>
                        <Input 
                          id="max-value" 
                          type="number" 
                          placeholder="No maximum"
                          className="mt-1" 
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="logic" className="m-0">
                  <p className="text-slate text-sm">
                    Configure conditional logic for this question.
                  </p>
                  
                  <div className="mt-6 border border-dashed border-slate/40 rounded-lg p-4 text-center">
                    <p className="text-slate">Advanced logic coming soon!</p>
                  </div>
                </TabsContent>
              </div>
              
              <div className="p-4 border-t mt-auto">
                <div className="flex justify-between">
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex items-center gap-2">
                    {selectedQuestionIndex > 0 && (
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}
                    {selectedQuestionIndex < form.questions.length - 1 && (
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          ) : (
            <div className="p-6 h-full flex flex-col">
              <h3 className="font-heading font-semibold text-midnight text-lg mb-4">
                Question Types
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
                {questionTypes.map((qType) => (
                  <button
                    key={qType.type}
                    className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:border-teal hover:bg-teal/5 transition-colors"
                    onClick={() => handleAddQuestion(qType.type)}
                  >
                    <div className="h-10 w-10 flex items-center justify-center text-midnight mb-2">
                      {qType.icon}
                    </div>
                    <span className="text-sm font-medium">{qType.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-auto pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="templates">
                    <AccordionTrigger>Question Templates</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleAddQuestion('text')}
                        >
                          <div>
                            <div className="font-medium">Name</div>
                            <div className="text-xs text-slate">First and last name</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleAddQuestion('email')}
                        >
                          <div>
                            <div className="font-medium">Email Address</div>
                            <div className="text-xs text-slate">Email with validation</div>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => handleAddQuestion('singleChoice')}
                        >
                          <div>
                            <div className="font-medium">Satisfaction Rating</div>
                            <div className="text-xs text-slate">1-5 rating scale</div>
                          </div>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;