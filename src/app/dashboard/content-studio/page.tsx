
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { PageCanvas } from '@/components/visual-editor/page-canvas'; // New Import
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContentPiece, PageStructure } from '@/types'; // Updated Import
import { mockContentData } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

// Hardcoded example PageStructure for initial display
const mockPageStructure: PageStructure = {
  id: 'mock-page-1',
  title: 'My Visually Edited Page Title',
  blocks: [
    {
      id: 'block-1',
      type: 'text',
      props: { text: 'Welcome to this visually constructed page! This is a paragraph of text.', level: 'p' },
    },
    {
      id: 'block-2',
      type: 'image',
      props: { src: 'https://placehold.co/800x300.png', alt: 'A placeholder banner image', dataAiHint: "banner image" },
    },
    {
      id: 'block-3',
      type: 'container',
      props: {},
      children: [
        {
          id: 'block-3-1',
          type: 'text',
          props: { text: 'This text is inside a container.', level: 'h3' },
        },
        {
          id: 'block-3-2',
          type: 'button',
          props: { text: 'Click Me!', variant: 'secondary' },
        },
      ],
    },
     {
      id: 'block-4',
      type: 'text',
      props: { text: 'Another paragraph to demonstrate structure.', level: 'p' },
    },
  ],
};


function ContentStudioInner() {
  const searchParams = useSearchParams();
  const [editorMode, setEditorMode] = useState<'form' | 'chat'>('form');
  const [initialContent, setInitialContent] = useState<ContentPiece | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [pageTitle, setPageTitle] = useState("Content Studio");

  // State for the visual editor's page structure
  const [currentPageStructure, setCurrentPageStructure] = useState<PageStructure | null>(mockPageStructure);


  const editId = searchParams.get('editId');

  useEffect(() => {
    if (editId) {
      setPageTitle("Edit Content");
      const contentToEdit = mockContentData.find(content => content.id === editId);
      if (contentToEdit) {
        setInitialContent(contentToEdit);
      } else {
        console.warn(`Content with ID ${editId} not found for editing.`);
      }
    } else {
      setPageTitle("Content Studio");
      setInitialContent(null); 
    }
    setIsLoadingContent(false);
  }, [editId]);

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
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl font-bold text-primary">{pageTitle}</h1>
        <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'form' | 'chat')} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="form">Form Editor</TabsTrigger>
            <TabsTrigger value="chat">Visual/Chat Editor</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {editorMode === 'form' && (
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
                 {/* In the future, ChatInterface might update currentPageStructure */}
                <ChatInterface />
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <PageCanvas page={currentPageStructure} />
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
