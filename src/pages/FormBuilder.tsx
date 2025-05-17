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
  const { getForm, createForm, updateForm, addQuestion } = useForm(); // Removed unused 'forms' import
  
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState(''); // Default to empty string
  const [description, setDescription] = useState(''); // Default to empty string
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Added missing isDragging state

  useEffect(() => {
    if (formId && formId !== 'new') {
      const existingForm = getForm(formId);
      if (existingForm) {
        setForm(existingForm);
        setTitle(existingForm.title || '');
        setDescription(existingForm.description || '');
      } else {
        // If formId is provided but not found, redirect to create a new one or show error
        // For now, let's redirect to new, but ideally, a NotFound or error message would be better.
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
        // createdAt and updatedAt are handled by createForm in context
      });
      setForm(newFormInstance);
      setTitle(newFormInstance.title);
      setDescription(newFormInstance.description);
      // Important: redirect to the new form's ID to avoid re-creating on refresh
      navigate(`/builder/${newFormInstance.id}`, { replace: true });
    } else if (!formId) {
        // Handle case where formId is undefined (e.g. navigating to /builder directly)
        navigate('/builder/new', { replace: true });
    }
  }, [formId, getForm, createForm, navigate]);

// ... existing code ...

  if (!form) return <div className="p-4 text-center">Loading form data...</div>;

  // ... existing code ...
        <div className="bg-white rounded-xl shadow-md h-full overflow-hidden flex flex-col">
          {(selectedQuestionIndex !== null && form.questions && form.questions[selectedQuestionIndex]) ? (
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
                        value={form.questions[selectedQuestionIndex]?.title || ''} 
                        placeholder="Enter question title" 
                        className="mt-1"
                        // Add onChange handler here to update question title in context
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="question-description">Description (Optional)</Label>
                      <Textarea 
                        id="question-description" 
                        value={form.questions[selectedQuestionIndex]?.description || ''} 
                        placeholder="Add description" 
                        className="mt-1 resize-none" 
                        rows={2}
                        // Add onChange handler here to update question description in context
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="required-switch">Required</Label>
                      <Switch 
                        id="required-switch" 
                        checked={form.questions[selectedQuestionIndex]?.required || false} 
                        // Add onCheckedChange handler here
                      />
                    </div>
                    
                    {(form.questions[selectedQuestionIndex]?.type === 'singleChoice' || 
                      form.questions[selectedQuestionIndex]?.type === 'multipleChoice') && (
// ... existing code ...
                  {['text', 'longText'].includes(form.questions[selectedQuestionIndex]?.type || '') && (
// ... existing code ...
                  {form.questions[selectedQuestionIndex]?.type === 'number' && (
// ... existing code ...
                    {selectedQuestionIndex < (form.questions?.length || 0) - 1 && (
// ... existing code ...
            </Tabs>
          ) : (
            <div className="p-6 h-full flex flex-col">
// ... existing code ...