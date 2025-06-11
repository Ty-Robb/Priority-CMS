
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { PageCanvas } from '@/components/visual-editor/page-canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContentPiece, PageStructure } from '@/types';
import { mockContentData } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

// Hardcoded example PageStructure for initial display when *editing*
const initialMockPageStructureForEditing: PageStructure = {
  id: 'mock-page-1',
  title: 'My Visually Edited Page Title',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      props: { text: 'Welcome to this visually constructed page! This is a paragraph of text.', level: 'p' },
    },
    {
      id: 'block-img-hero',
      type: 'image',
      props: { src: 'https://placehold.co/800x300.png', alt: 'A placeholder banner image', dataAiHint: "banner image", width: 800, height: 300 },
    },
    {
      id: 'block-list-1',
      type: 'list',
      props: {
        ordered: false,
        items: [
          { id: 'item-1', text: 'First feature item' },
          { id: 'item-2', text: 'Second amazing point' },
          { id: 'item-3', text: 'Third important detail' },
        ],
      },
    },
    {
      id: 'block-container-1',
      type: 'container',
      props: {},
      children: [
        {
          id: 'block-c1-text1',
          type: 'text',
          props: { text: 'This text is inside a container.', level: 'h3' },
        },
        {
          id: 'block-c1-button1',
          type: 'button',
          props: { text: 'Click Me!', variant: 'secondary' },
        },
      ],
    },
    {
      id: 'block-quote-1',
      type: 'quote',
      props: {
        text: "The only way to do great work is to love what you do.",
        citation: "Steve Jobs"
      }
    },
     {
      id: 'block-para-2',
      type: 'text',
      props: { text: 'Another paragraph to demonstrate structure and new block types.', level: 'p' },
    },
  ],
};


function ContentStudioInner() {
  const searchParams = useSearchParams();
  const [editorMode, setEditorMode] = useState<'form' | 'chat'>('form');
  const [initialContent, setInitialContent] = useState<ContentPiece | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [pageTitle, setPageTitle] = useState("Content Studio");
  const [currentPageStructure, setCurrentPageStructure] = useState<PageStructure | null>(null); // Initialize to null

  const editId = searchParams.get('editId');

  useEffect(() => {
    setIsLoadingContent(true);
    if (editId) {
      setPageTitle("Edit Content");
      const contentToEdit = mockContentData.find(content => content.id === editId);
      if (contentToEdit) {
        setInitialContent(contentToEdit);
        // For editing, we use the mock structure.
        // In a real app, you'd load the actual saved visual structure for this content piece.
        setCurrentPageStructure(initialMockPageStructureForEditing);
      } else {
        console.warn(`Content with ID ${editId} not found for editing.`);
        setPageTitle("Create New Content (ID not found)");
        setInitialContent(null);
        setCurrentPageStructure(null); // Treat as new if ID is invalid
      }
      setEditorMode('form'); // Default to form editor when editing existing content
    } else {
      // Creating new content
      setPageTitle("Create New Content");
      setInitialContent(null);
      setEditorMode('chat'); // Default to chat/visual editor for new content
      setCurrentPageStructure(null); // Start with an empty canvas for new content
    }
    setIsLoadingContent(false);
  }, [editId]);

  const handleUpdatePageStructure = (updatedPage: PageStructure | null) => {
    setCurrentPageStructure(updatedPage);
  };

  if (isLoadingContent && editId) {
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
          {/* CardFooter was removed previously, ensure it's not used if not imported or defined */}
        </Card>
      </div>
    );
  }


  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl font-bold text-primary">{pageTitle}</h1>
        {editId && ( // Only show tabs if an editId is present
          <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'form' | 'chat')} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="form">Form Editor</TabsTrigger>
              <TabsTrigger value="chat">Visual/Chat Editor</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {editorMode === 'form' && editId && (
        <div className="grid grid-cols-1 gap-8 items-start">
          <div>
            <ContentForm initialContent={initialContent || undefined} />
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
                <ChatInterface setCurrentPageStructure={handleUpdatePageStructure} />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <PageCanvas page={currentPageStructure} onUpdatePageStructure={handleUpdatePageStructure} />
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
