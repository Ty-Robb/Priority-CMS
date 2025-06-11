
"use client";

import type { ChangeEvent } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generatePageContent, type GeneratePageContentOutput } from '@/ai/flows/generate-page-content';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    const currentInput = inputValue; // Store for use in async
    setInputValue('');
    setIsSending(true);

    const createPageKeywords = ['create a page', 'generate a page', 'make a webpage', 'design a page about', 'draft a page for'];
    const isCreatePageRequest = createPageKeywords.some(keyword => currentInput.toLowerCase().includes(keyword));

    if (isCreatePageRequest) {
      try {
        const aiResponse: GeneratePageContentOutput = await generatePageContent({ prompt: currentInput });

        const aiGeneratedMessages: ChatMessage[] = [];
        aiGeneratedMessages.push({
          id: (Date.now() + 1).toString(),
          text: `Okay, I've drafted a page titled: "${aiResponse.pageTitle}"`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        });

        aiResponse.sections.forEach((section, index) => {
          aiGeneratedMessages.push({
            id: (Date.now() + 2 + index * 2).toString(), // Ensure unique IDs
            text: `Section: ${section.sectionTitle}`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
          });
          aiGeneratedMessages.push({
            id: (Date.now() + 3 + index * 2).toString(), // Ensure unique IDs
            text: section.sectionContent,
            sender: 'ai',
            timestamp: new Date().toISOString(),
          });
        });
        setMessages((prevMessages) => [...prevMessages, ...aiGeneratedMessages]);

      } catch (error) {
        console.error("Error generating page content:", error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I had trouble generating the page content. Please try again or rephrase your request.",
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } else {
      // Simulate standard AI response for other queries
      await new Promise(resolve => setTimeout(resolve, 1000));
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request. How can I help further with your content or document analysis?",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }
    setIsSending(false);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newSystemMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Document "${file.name}" selected. What should I do with it? (e.g., summarize, extract keywords, explain concepts)`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, newSystemMessage]);
      toast({
        title: "Document Selected",
        description: `"${file.name}" is ready. Ask the AI what to do with it.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg max-w-[85%]',
              msg.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 
              msg.sender === 'ai' ? 'bg-muted' : 'bg-accent/50 text-accent-foreground italic text-sm mx-auto'
            )}
          >
            {msg.sender === 'ai' && <Bot className="h-5 w-5 text-primary flex-shrink-0" />}
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className={cn(
                "text-xs mt-1",
                 msg.sender === 'user' ? 'text-primary-foreground/70' : 
                 msg.sender === 'ai' ? 'text-muted-foreground/70' : 'text-accent-foreground/70'
                )}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
             {msg.sender === 'user' && <User className="h-5 w-5 text-primary-foreground flex-shrink-0" />}
          </div>
        ))}
         {messages.length === 0 && (
          <div className="text-center text-muted-foreground p-8">
            <Bot size={48} className="mx-auto mb-2" />
            <p>Ask me to generate page content (e.g., "Create a page about a new coffee shop") or upload a document to get started!</p>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.md" 
          />
          <Button variant="ghost" size="icon" onClick={triggerFileUpload} aria-label="Upload document">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask to create a page or type your message..."
            className="flex-grow"
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
            disabled={isSending}
          />
          <Button onClick={handleSendMessage} disabled={isSending || inputValue.trim() === ''} aria-label="Send message">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
