import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useForm } from '../context/FormContext';

const TemplateLibrary = () => {
  const { templates, createFromTemplate } = useForm();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && template.category.toLowerCase() === activeTab.toLowerCase();
  });

  // Get unique categories
  const categories = ['all', ...new Set(templates.map(t => t.category.toLowerCase()))];

  const handleUseTemplate = (templateId: string) => {
    const newForm = createFromTemplate(templateId);
    if (newForm) {
      navigate(`/builder/${newForm.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-midnight">Template Library</h1>
          <p className="text-slate mt-1">Start with a pre-built template to save time</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
          <Input 
            type="text" 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-10 px-4 flex gap-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>

      <Tabs 
        defaultValue="all" 
        className="w-full" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="capitalize"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="overflow-hidden border border-border hover:shadow-md transition-shadow">
                <div 
                  className="h-48 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${template.thumbnail})` }}
                ></div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3 bg-teal/10 text-teal border-teal/20">
                    {template.category}
                  </Badge>
                  <h3 className="font-heading font-semibold text-lg text-midnight mb-2">
                    {template.title}
                  </h3>
                  <p className="text-slate line-clamp-3 mb-4 text-sm">
                    {template.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate">
                      {template.form.questions.length} questions
                    </div>
                    <Button 
                      onClick={() => handleUseTemplate(template.id)}
                      className="bg-teal hover:bg-teal/90 text-white"
                    >
                      Use Template
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateLibrary;