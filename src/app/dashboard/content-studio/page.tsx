
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContentPiece } from '@/types';
import { mockContentData } from '@/lib/mock-data'; // Import centralized mock data
import { Skeleton } from '@/components/ui/skeleton';


function ContentStudioInner() {
  const searchParams = useSearchParams();
  const [editorMode, setEditorMode] = useState<'form' | 'chat'>('form');
  const [initialContent, setInitialContent] = useState<ContentPiece | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [pageTitle, setPageTitle] = useState("Content Studio");

  const editId = searchParams.get('editId');

  useEffect(() => {
    if (editId) {
      setPageTitle("Edit Content");
      const contentToEdit = mockContentData.find(content => content.id === editId);
      if (contentToEdit) {
        setInitialContent(contentToEdit);
      } else {
        // Handle case where content with editId is not found, e.g., show error or redirect
        console.warn(`Content with ID ${editId} not found for editing.`);
      }
    } else {
      setPageTitle("Content Studio");
      setInitialContent(null); // Ensure no initial content when creating new
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
            <TabsTrigger value="chat">Chat Editor</TabsTrigger>
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
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Chat-based Content Creation</CardTitle>
            </CardHeader>
            <CardContent>
               <ChatInterface /> {/* Chat editor might also need initialContent in the future */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <ContentStudioInner />
    </Suspense>
  )
}
