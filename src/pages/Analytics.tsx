import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  BarChart4, 
  PieChart,
  Layers,
  BarChart2,
  LineChart as LineChartIcon,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { useForm } from '../context/FormContext';
import { FormResponse, Form } from '../types/form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as RechartLine, Line, Cell, PieChart as RechartPie, Pie } from 'recharts';

// Utility function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Function to calculate time difference in seconds
const calculateTimeDiff = (startDate: Date, endDate: Date): number => {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
};

// Function to format time in minutes and seconds
const formatTimeSpent = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
};

// Function to group responses by date
const groupResponsesByDate = (responses: FormResponse[]): { date: string; count: number }[] => {
  const dateMap: Record<string, number> = {};
  
  responses.forEach(response => {
    const date = formatDate(response.metadata.completedAt);
    dateMap[date] = (dateMap[date] || 0) + 1;
  });
  
  return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
};

// Function to get answer counts for a specific question
const getAnswerCounts = (responses: FormResponse[], questionId: string, choices?: { id: string; label: string; value: string }[]) => {
  const answerMap: Record<string, number> = {};
  
  responses.forEach(response => {
    const answer = response.answers[questionId];
    
    if (answer === undefined || answer === '') return;
    
    if (Array.isArray(answer)) {
      // Handle multiple choice questions
      answer.forEach(value => {
        answerMap[value] = (answerMap[value] || 0) + 1;
      });
    } else {
      // Handle single answer questions
      answerMap[answer] = (answerMap[answer] || 0) + 1;
    }
  });
  
  if (choices) {
    // For choice-based questions, ensure all choices are represented
    return choices.map(choice => ({
      name: choice.label,
      value: answerMap[choice.value] || 0
    }));
  }
  
  // For other question types
  return Object.entries(answerMap).map(([answer, count]) => ({
    name: answer,
    value: count
  }));
};

// Colors for charts
const CHART_COLORS = ['#191970', '#5F9EA0', '#FFD700', '#708090', '#4B0082', '#8B0000', '#006400'];

const Analytics = () => {
  const { formId } = useParams();
  const { getForm, getResponses } = useForm();
  
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    if (formId) {
      const formData = getForm(formId);
      if (formData) {
        setForm(formData);
        setResponses(getResponses(formId));
      }
    }
  }, [formId, getForm, getResponses]);

  if (!form) {
    return <div>Loading...</div>;
  }

  // Calculate basic statistics
  const totalResponses = responses.length;
  const averageTimeToComplete = totalResponses > 0
    ? responses.reduce((sum, response) => {
        return sum + calculateTimeDiff(
          new Date(response.metadata.startedAt),
          new Date(response.metadata.completedAt)
        );
      }, 0) / totalResponses
    : 0;
  
  const completionRatePercentage = 100; // In a real app, you'd track started vs completed forms
  const responsesByDate = groupResponsesByDate(responses);

  // Additional data for charts
  const responseTimesData = responses.map(response => ({
    id: response.id.slice(0, 8),
    seconds: calculateTimeDiff(new Date(response.metadata.startedAt), new Date(response.metadata.completedAt))
  }));

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-midnight">{form.title}</h1>
            <p className="text-slate">{totalResponses} responses</p>
          </div>
        </div>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-teal mr-2" />
                  <span className="text-2xl font-bold text-midnight">{totalResponses}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">Avg. Time to Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-teal mr-2" />
                  <span className="text-2xl font-bold text-midnight">
                    {formatTimeSpent(Math.floor(averageTimeToComplete))}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <BarChart4 className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-midnight">{completionRatePercentage}%</span>
                  </div>
                  <Progress value={completionRatePercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate">Last Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-teal mr-2" />
                  <span className="text-lg font-medium text-midnight">
                    {responses.length > 0 
                      ? formatDate(responses[responses.length - 1].metadata.completedAt) 
                      : 'No responses yet'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Responses Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLine
                    data={responsesByDate}
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => value.toFixed(0)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#5F9EA0" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2} 
                    />
                  </RechartLine>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Response Times</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={responseTimesData.slice(0, 10)} // Limit to 10 for better visibility
                    margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="id" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tickFormatter={(seconds) => `${Math.floor(seconds / 60)}m`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${formatTimeSpent(value)}`, 'Time to Complete']}
                      labelFormatter={(id) => `Response ${id}`}
                    />
                    <Bar 
                      dataKey="seconds" 
                      fill="#191970" 
                      radius={[4, 4, 0, 0]}
                    >
                      {responseTimesData.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {form.questions.map((question, index) => {
            if (question.type === 'singleChoice' || question.type === 'multipleChoice') {
              const data = getAnswerCounts(responses, question.id, question.choices);
              
              return (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      {index + 1}. {question.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartPie>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {data.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartPie>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="space-y-4">
                          {data.map((answer, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-sm mr-2" 
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                  ></div>
                                  <span className="text-sm font-medium">{answer.name}</span>
                                </div>
                                <span className="text-sm font-medium">{answer.value}</span>
                              </div>
                              <Progress 
                                value={(answer.value / responses.length) * 100} 
                                className="h-2"
                                style={{ 
                                  backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20`,
                                  '--progress-fill': CHART_COLORS[index % CHART_COLORS.length]
                                } as React.CSSProperties}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            return null;
          })}
          
          <div className="border border-dashed border-slate rounded-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-slate" />
            </div>
            <h3 className="text-lg font-medium text-midnight mb-2">Add Custom Widget</h3>
            <p className="text-slate mb-4 max-w-md mx-auto">
              Create custom analytics widgets for more detailed insights into your form responses.
            </p>
            <Button variant="outline">Add Widget</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Individual Responses</CardTitle>
            </CardHeader>
            <div className="border-t">
              {responses.length > 0 ? (
                <div className="divide-y">
                  {responses.map((response, index) => (
                    <div key={response.id} className="p-6 hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-midnight">Response #{index + 1}</h3>
                          <p className="text-sm text-slate">
                            {formatDate(response.metadata.completedAt)} • Completed in {formatTimeSpent(
                              calculateTimeDiff(new Date(response.metadata.startedAt), new Date(response.metadata.completedAt))
                            )}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                      
                      <div className="space-y-3">
                        {form.questions.slice(0, 3).map(question => (
                          <div key={question.id} className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 text-sm font-medium">{question.title}</div>
                            <div className="col-span-2 text-sm">
                              {Array.isArray(response.answers[question.id]) 
                                ? (response.answers[question.id] as string[]).join(', ') 
                                : String(response.answers[question.id] || 'Not answered')}
                            </div>
                          </div>
                        ))}
                        
                        {form.questions.length > 3 && (
                          <div className="text-sm text-teal">+ {form.questions.length - 3} more answers</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mb-4">
                    <Layers className="h-6 w-6 text-slate" />
                  </div>
                  <h3 className="text-lg font-medium text-midnight mb-2">No responses yet</h3>
                  <p className="text-slate max-w-md mx-auto">
                    Responses will appear here as people complete your form.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Question Analysis</CardTitle>
            </CardHeader>
            <div className="border-t">
              <div className="divide-y">
                {form.questions.map((question, index) => (
                  <div key={question.id} className="p-6 hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-midnight">
                          {index + 1}. {question.title}
                        </h3>
                        <p className="text-sm text-slate">
                          {question.type === 'singleChoice' || question.type === 'multipleChoice' 
                            ? `${question.choices?.length || 0} options` 
                            : question.type}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <BarChart2 className="h-4 w-4" />
                          <span className="hidden md:inline">Bar Chart</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <PieChart className="h-4 w-4" />
                          <span className="hidden md:inline">Pie Chart</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <LineChartIcon className="h-4 w-4" />
                          <span className="hidden md:inline">Line Chart</span>
                        </Button>
                      </div>
                    </div>
                    
                    {(question.type === 'singleChoice' || question.type === 'multipleChoice') && (
                      <div className="space-y-2">
                        {getAnswerCounts(responses, question.id, question.choices).map((answer, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{answer.name}</span>
                              <span className="text-sm font-medium">
                                {answer.value} {answer.value === 1 ? 'response' : 'responses'}
                              </span>
                            </div>
                            <Progress 
                              value={responses.length > 0 ? (answer.value / responses.length) * 100 : 0} 
                              className="h-2"
                              style={{ 
                                backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`,
                                '--progress-fill': CHART_COLORS[i % CHART_COLORS.length]
                              } as React.CSSProperties}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!(question.type === 'singleChoice' || question.type === 'multipleChoice') && (
                      <div className="border border-dashed border-slate rounded-lg p-4 text-center">
                        <p className="text-sm text-slate">
                          {responses.length > 0 
                            ? 'Text responses can be viewed in the Responses tab' 
                            : 'No responses yet'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;