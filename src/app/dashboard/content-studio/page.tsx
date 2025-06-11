
"use client";

import { useState } from 'react';
import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentStudioPage() {
  const [editorMode, setEditorMode] = useState<'form' | 'chat'>('form');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h1 className="font-headline text-3xl font-bold text-primary">Content Studio</h1>
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
            <ContentForm />
          </div>
        </div>
      )}

      {editorMode === 'chat' && (
        <div className="mt-4">
          {/* Primary Chat Interface for Content Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-xl">Chat-based Content Creation</CardTitle>
            </CardHeader>
            <CardContent>
               <ChatInterface /> {/* Main Chat Editor */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
