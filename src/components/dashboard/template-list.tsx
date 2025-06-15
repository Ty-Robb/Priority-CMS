import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';

// Template types
type TemplateStatus = 'Draft' | 'Published' | 'Archived';
type TemplateType = 'Page' | 'Section' | 'Component' | 'Email' | 'Social';

interface TemplateField {
  id: string;
  name: string;
  description?: string;
  type: string;
  validation?: {
    required?: boolean;
    min_length?: number;
    max_length?: number;
  };
  is_searchable?: boolean;
  is_localized?: boolean;
  is_hidden?: boolean;
  group?: string;
  order: number;
}

interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  is_repeatable: boolean;
  min_items?: number;
  max_items?: number;
  order: number;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  sections: TemplateSection[];
  status: TemplateStatus;
  is_default: boolean;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface PaginationMeta {
  page: number;
  page_size: number;
  total_items?: number;
  total_pages?: number;
  has_next: boolean;
  has_prev: boolean;
}

interface TemplateListProps {
  initialTemplates?: Template[];
}

export default function TemplateList({ initialTemplates = [] }: TemplateListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    has_next: false,
    has_prev: false,
  });

  // Fetch templates
  const fetchTemplates = async (
    page: number = 1,
    filter: string = 'all'
  ) => {
    setLoading(true);
    setError(null);

    try {
      let url = `/api/templates?page=${page}&page_size=${pagination.page_size}`;

      if (filter !== 'all') {
        if (['Draft', 'Published', 'Archived'].includes(filter)) {
          url = `/api/templates/status/${filter}?page=${page}&page_size=${pagination.page_size}`;
        } else if (['Page', 'Section', 'Component', 'Email', 'Social'].includes(filter)) {
          url = `/api/templates/type/${filter}?page=${page}&page_size=${pagination.page_size}`;
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching templates: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(data.items);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // In development mode, use mock data
      if (process.env.NODE_ENV === 'development') {
        setTemplates(initialTemplates);
        setPagination({
          page: 1,
          page_size: 10,
          total_items: initialTemplates.length,
          total_pages: Math.ceil(initialTemplates.length / 10),
          has_next: initialTemplates.length > 10,
          has_prev: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchTemplates(1, value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchTemplates(page, activeTab);
  };

  // Handle template creation
  const handleCreateTemplate = () => {
    router.push('/dashboard/templates/create');
  };

  // Handle template edit
  const handleEditTemplate = (id: string) => {
    router.push(`/dashboard/templates/edit/${id}`);
  };

  // Handle template delete
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting template: ${response.statusText}`);
      }

      // Remove template from state
      setTemplates(templates.filter(template => template.id !== id));
      
      toast({
        title: 'Template deleted',
        description: 'The template has been deleted successfully.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error deleting template:', err);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Get status badge color
  const getStatusColor = (status: TemplateStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-green-500';
      case 'Draft':
        return 'bg-yellow-500';
      case 'Archived':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get type badge color
  const getTypeColor = (type: TemplateType) => {
    switch (type) {
      case 'Page':
        return 'bg-blue-500';
      case 'Section':
        return 'bg-purple-500';
      case 'Component':
        return 'bg-indigo-500';
      case 'Email':
        return 'bg-pink-500';
      case 'Social':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button onClick={handleCreateTemplate}>Create Template</Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Published">Published</TabsTrigger>
          <TabsTrigger value="Draft">Draft</TabsTrigger>
          <TabsTrigger value="Archived">Archived</TabsTrigger>
          <TabsTrigger value="Page">Pages</TabsTrigger>
          <TabsTrigger value="Component">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No templates found.</p>
              <Button onClick={handleCreateTemplate} className="mt-4">Create your first template</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  {template.thumbnail_url && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={template.thumbnail_url} 
                        alt={template.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{template.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(template.status)}>{template.status}</Badge>
                        <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                      </div>
                    </div>
                    <CardDescription>{template.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      <p>Sections: {template.sections.length}</p>
                      <p>Version: {template.version}</p>
                      <p>Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleEditTemplate(template.id)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>Delete</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {pagination.total_pages && pagination.total_pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </TabsContent>

        {/* Other tab contents will be identical, just with filtered data */}
        {['Published', 'Draft', 'Archived', 'Page', 'Component'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {/* Same content as "all" tab */}
            {loading ? (
              <div className="text-center py-8">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No templates found.</p>
                <Button onClick={handleCreateTemplate} className="mt-4">Create your first template</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    {/* Same card content as in "all" tab */}
                    {template.thumbnail_url && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={template.thumbnail_url} 
                          alt={template.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{template.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(template.status)}>{template.status}</Badge>
                          <Badge className={getTypeColor(template.type)}>{template.type}</Badge>
                        </div>
                      </div>
                      <CardDescription>{template.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        <p>Sections: {template.sections.length}</p>
                        <p>Version: {template.version}</p>
                        <p>Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => handleEditTemplate(template.id)}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>Delete</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {pagination.total_pages && pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
