import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useForm } from '../context/FormContext';

const Dashboard = () => {
  const { forms, responses } = useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter forms based on search term
  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getResponseCount = (formId: string) => {
    return responses.filter(response => response.formId === formId).length;
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-midnight">Forms Dashboard</h1>
        <Link to="/builder/new">
          <Button className="bg-teal hover:bg-teal/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
          <Input 
            type="text" 
            placeholder="Search forms..." 
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

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Forms</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileEdit className="h-12 w-12 text-slate" />
              </div>
              <h3 className="text-xl font-medium text-midnight mb-2">No forms found</h3>
              <p className="text-slate mb-6">Create your first form to get started</p>
              <Link to="/builder/new">
                <Button className="bg-teal hover:bg-teal/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map(form => (
                <Card key={form.id} className="overflow-hidden border border-border hover:shadow-md transition-shadow">
                  <div className="bg-midnight h-3"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-midnight mb-1">
                          {form.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate mb-4">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Created {formatDate(form.createdAt)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-slate line-clamp-2 mb-4 text-sm">
                      {form.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Badge variant="outline" className="bg-teal/10 text-teal border-teal/20">
                        {getResponseCount(form.id)} Responses
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/analytics/${form.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <LineChart className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/builder/${form.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/form/${form.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .slice(0, 6)
              .map(form => (
                <Card key={form.id} className="overflow-hidden border border-border hover:shadow-md transition-shadow">
                  <div className="bg-midnight h-3"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-midnight mb-1">
                          {form.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate mb-4">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Updated {formatDate(form.updatedAt)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-slate line-clamp-2 mb-4 text-sm">
                      {form.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Badge variant="outline" className="bg-teal/10 text-teal border-teal/20">
                        {getResponseCount(form.id)} Responses
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/analytics/${form.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <LineChart className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/builder/${form.id}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/form/${form.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="h-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-0">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileEdit className="h-12 w-12 text-slate" />
            </div>
            <h3 className="text-xl font-medium text-midnight mb-2">No drafts yet</h3>
            <p className="text-slate mb-6">Draft forms will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;