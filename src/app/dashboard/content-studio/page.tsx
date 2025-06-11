
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { PageCanvas } from '@/components/visual-editor/page-canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContentPiece, PageStructure } from '@/types';
import { mockContentData } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Added Button
import { Save, Loader2 } from 'lucide-react'; // Added Save icon
import { useToast } from '@/hooks/use-toast'; // Added useToast

const fallbackMockPageStructureForEditing: PageStructure = {
  id: 'mock-page-fallback-1',
  title: 'My Visually Edited Page Title (Fallback)',
  blocks: [
    {
      id: 'block-fallback-1',
      type: 'text',
      props: { text: 'Welcome! This content is being structured. This is a paragraph of text.', level: 'p' },
    },
    {
      id: 'block-fallback-img-hero',
      type: 'image',
      props: { src: 'https://placehold.co/800x300.png', alt: 'A placeholder banner image', dataAiHint: "banner image", width: 800, height: 300 },
    },
    {
      id: 'block-fallback-list-1',
      type: 'list',
      props: {
        ordered: false,
        items: [
          { id: 'item-fallback-1', text: 'First feature item' },
          { id: 'item-fallback-2', text: 'Second amazing point' },
        ],
      },
    },
  ],
};


function ContentStudioInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [editorMode, setEditorMode] = useState<'form' | 'chat'>('form');
  const [initialContent, setInitialContent] = useState<ContentPiece | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  
  // pageTitle is for the title displayed on canvas & potentially saved
  const [pageTitle, setPageTitle] = useState("Create New Content"); 
  // headerTitle is just for the H1 of the content studio page itself
  const [headerTitle, setHeaderTitle] = useState("Create New Content");

  const [currentPageStructure, setCurrentPageStructure] = useState<PageStructure | null>(null);
  const [isSavingVisual, setIsSavingVisual] = useState(false);

  const editId = searchParams.get('editId');

  useEffect(() => {
    setIsLoadingContent(true);
    if (editId) {
      const contentToEdit = mockContentData.find(content => content.id === editId);
      if (contentToEdit) {
        setHeaderTitle(`Edit Content: ${contentToEdit.title}`);
        setPageTitle(contentToEdit.pageStructure?.title || contentToEdit.title || "Untitled Page");
        setInitialContent(contentToEdit);
        setCurrentPageStructure(contentToEdit.pageStructure || fallbackMockPageStructureForEditing);
        // No default editorMode change here, let user decide or stick to previous if any
      } else {
        console.warn(`Content with ID ${editId} not found for editing.`);
        setHeaderTitle("Create New Content (ID not found)");
        setPageTitle("New Page Title");
        setInitialContent(null);
        setCurrentPageStructure(null);
        setEditorMode('chat'); 
      }
    } else {
      setHeaderTitle("Create New Content");
      setPageTitle("New Page Title"); // Default title for new page canvas
      setInitialContent(null);
      setCurrentPageStructure(null);
      setEditorMode('chat'); 
    }
    setIsLoadingContent(false);
  }, [editId]);

  const handleUpdatePageStructure = useCallback((updatedPage: PageStructure | null) => {
    setCurrentPageStructure(updatedPage);
    if (updatedPage?.title && updatedPage.title !== pageTitle) {
      setPageTitle(updatedPage.title); // Sync canvas title changes to pageTitle state
    }
  },[pageTitle]);

  const handleUpdatePageTitleFromCanvas = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
  }, []);
  
  const handleVisualSave = () => {
    setIsSavingVisual(true);
    let savedContentPiece: ContentPiece;

    if (initialContent && editId) { // Updating existing content
        const index = mockContentData.findIndex(item => item.id === editId);
        if (index !== -1) {
            mockContentData[index] = {
                ...mockContentData[index],
                title: pageTitle, // Use the state `pageTitle` which might have been edited on canvas
                pageStructure: currentPageStructure,
                body: currentPageStructure ? "" : mockContentData[index].body, // Clear body if pageStructure exists
                updatedAt: new Date().toISOString(),
            };
            savedContentPiece = mockContentData[index];
            setInitialContent(savedContentPiece); // Update initialContent state
            toast({ title: "Visual Content Updated!", description: "Your visual changes have been saved." });
        } else {
            toast({ title: "Error", description: "Could not find content to update.", variant: "destructive" });
            setIsSavingVisual(false);
            return;
        }
    } else { // Creating new content
        const newId = String(Date.now() + Math.random());
        const newContent: ContentPiece = {
            id: newId,
            title: pageTitle, // Use the state `pageTitle`
            body: "", // New visual content starts with no simple body
            status: 'Draft',
            contentType: 'Visual Page', // Mark as visually created
            keywords: [],
            generatedHeadlines: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pageStructure: currentPageStructure,
        };
        mockContentData.push(newContent);
        savedContentPiece = newContent;
        setInitialContent(savedContentPiece); // Set as initial content
        setHeaderTitle(`Edit Content: ${newContent.title}`); // Update header
        toast({ title: "Visual Content Saved!", description: "Your new page has been created and saved." });
        router.push(`/dashboard/content-studio?editId=${newId}`); // Navigate to edit mode
    }
    setIsSavingVisual(false);
  };

  const handleFormSaved = (savedContent: ContentPiece) => {
    // Update state if the form save affected the current content
    if (editId && savedContent.id === editId) {
      setInitialContent(savedContent);
      setHeaderTitle(`Edit Content: ${savedContent.title}`);
      // If form saves, it might affect pageStructure consistency.
      // For now, we assume form mainly edits body/title.
      // If it has pageStructure, it should ideally be synced or one mode preferred.
      // Let's re-evaluate if pageStructure exists and was potentially cleared by form save.
      if (savedContent.pageStructure) {
        setCurrentPageStructure(savedContent.pageStructure);
        setPageTitle(savedContent.pageStructure.title || savedContent.title);
      } else if (!savedContent.pageStructure && currentPageStructure) {
        // If form saved and cleared pageStructure, reflect that on canvas too or use fallback
         // setCurrentPageStructure(fallbackMockPageStructureForEditing); // Or null to force recreation
      }
      setPageTitle(savedContent.title); // Ensure pageTitle (for canvas) is also updated from form save
    }
  };


  if (isLoadingContent) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3 mb-8" />
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="font-headline text-3xl font-bold text-primary">{headerTitle}</h1>
        <div className="flex gap-2 items-center">
          {editorMode === 'chat' && (
            <Button onClick={handleVisualSave} disabled={isSavingVisual || !currentPageStructure}>
              {isSavingVisual ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Visual Changes
            </Button>
          )}
          {(editId || editorMode === 'form') && ( // Only show tabs if editing or form mode explicitly chosen
            <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'form' | 'chat')} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="form">Form Editor</TabsTrigger>
                <TabsTrigger value="chat">Visual Editor</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
           {!editId && editorMode === 'chat' && ( // If new content and in chat mode, no tabs needed initially
            <span /> // Placeholder or different UI if needed
           )}
        </div>
      </div>

      {editorMode === 'form' && (
        <div className="grid grid-cols-1 gap-8 items-start">
          <div>
            <ContentForm initialContent={initialContent || undefined} onFormSaved={handleFormSaved} />
          </div>
        </div>
      )}
      
      {editorMode === 'chat' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">AI Content Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatInterface 
                  setCurrentPageStructure={handleUpdatePageStructure} 
                  currentPageStructure={currentPageStructure} 
                  initialPageTitle={pageTitle} // Pass initialPageTitle
                />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <PageCanvas 
              page={currentPageStructure} 
              onUpdatePageStructure={handleUpdatePageStructure}
              initialTitle={pageTitle} // Pass initialTitle from ContentStudioInner's state
              onUpdateTitle={handleUpdatePageTitleFromCanvas} // Callback to update ContentStudioInner's pageTitle
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>Loading editor...</p></div>}>
      <ContentStudioInner />
    </Suspense>
  )
}

    