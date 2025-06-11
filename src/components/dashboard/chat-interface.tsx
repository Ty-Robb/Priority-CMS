
"use client";

import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage, PageStructure, VisualBlock } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generatePageContent, type GeneratePageContentOutput } from '@/ai/flows/generate-page-content'; 
import { addTextBlockToPage, type AddTextBlockToPageOutput } from '@/ai/flows/add-text-block-to-page-flow';

interface ChatInterfaceProps {
  setCurrentPageStructure: Dispatch<SetStateAction<PageStructure | null>>;
  currentPageStructure: PageStructure | null;
  initialPageTitle: string; // To set title when creating new page
}

export function ChatInterface({ setCurrentPageStructure, currentPageStructure, initialPageTitle }: ChatInterfaceProps) {
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
    const currentInput = inputValue;
    setInputValue('');
    setIsSending(true);

    const createPageKeywords = ['create a page', 'generate a page', 'make a webpage', 'design a page about', 'draft a page for'];
    const isCreatePageRequest = createPageKeywords.some(keyword => currentInput.toLowerCase().includes(keyword));

    const addParagraphKeywords = [
        "add paragraph saying ", 
        "add a paragraph: ", 
        "append paragraph: ", 
        "new paragraph: ", 
        "add text: "
    ];
    let isAddParagraphRequest = false;
    let paragraphTextContent = "";

    for (const keyword of addParagraphKeywords) {
        if (currentInput.toLowerCase().startsWith(keyword.toLowerCase())) {
            isAddParagraphRequest = true;
            paragraphTextContent = currentInput.substring(keyword.length).trim();
            if ((paragraphTextContent.startsWith('"') && paragraphTextContent.endsWith('"')) ||
                (paragraphTextContent.startsWith("'") && paragraphTextContent.endsWith("'"))) {
                paragraphTextContent = paragraphTextContent.substring(1, paragraphTextContent.length - 1);
            }
            break;
        }
    }

    if (isCreatePageRequest) {
      try {
        const aiResponse: GeneratePageContentOutput = await generatePageContent({ prompt: currentInput });

        const newBlocks: VisualBlock[] = [];
        aiResponse.sections.forEach((section, index) => {
          const titleId = `block-title-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`;
          const contentId = `block-content-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`;
          if (section.sectionTitle) {
            newBlocks.push({
              id: titleId,
              type: 'text',
              props: { text: section.sectionTitle, level: 'h2' },
            });
          }
          if (section.sectionContent) {
            newBlocks.push({
              id: contentId,
              type: 'text',
              props: { text: section.sectionContent, level: 'p' },
            });
          }
        });
        
        const newPageStructure: PageStructure = {
          id: `page-${Date.now()}`,
          title: aiResponse.pageTitle || initialPageTitle, // Use AI title or passed initial
          blocks: newBlocks,
        };
        setCurrentPageStructure(newPageStructure);

        const aiConfirmationMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `Okay, I've drafted a page titled: "${newPageStructure.title}". You can see it on the canvas and edit it there.`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, aiConfirmationMessage]);

      } catch (error) {
        console.error("Error generating page content:", error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I had trouble generating the page content. Please try again.",
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    } else if (isAddParagraphRequest) {
        if (!currentPageStructure) {
            toast({
                title: "No Page Loaded",
                description: "Please create or generate a page before adding content to it.",
                variant: "destructive",
            });
            const noPageMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "I can't add a paragraph because no page is currently loaded on the canvas. Try 'Create a page about...' first.",
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };
            setMessages((prevMessages) => [...prevMessages, noPageMessage]);
        } else if (!paragraphTextContent) {
             const noTextMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "What text would you like to add for the paragraph?",
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };
            setMessages((prevMessages) => [...prevMessages, noTextMessage]);
        }
        else {
            try {
                const result: AddTextBlockToPageOutput = await addTextBlockToPage({
                    currentPageStructure: currentPageStructure,
                    paragraphText: paragraphTextContent,
                });
                setCurrentPageStructure(result.updatedPageStructure);
                const aiConfirmationMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: "Okay, I've added the paragraph to the page.",
                    sender: 'ai',
                    timestamp: new Date().toISOString(),
                };
                setMessages((prevMessages) => [...prevMessages, aiConfirmationMessage]);
            } catch (error) {
                console.error("Error adding text block:", error);
                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: "Sorry, I encountered an issue adding that paragraph. Please try again.",
                    sender: 'ai',
                    timestamp: new Date().toISOString(),
                };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            }
        }
    }
    else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request. How can I help further? You can ask me to 'create a page about...' or, if a page is loaded, 'add paragraph saying ...'.",
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
        fileInputRef.current.value = ""; 
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
            <p>Ask me to generate page content (e.g., "Create a page about a new coffee shop") or try adding a paragraph to an existing page (e.g., "Add paragraph saying Hello World").</p>
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
          <Button variant="ghost" size="icon" onClick={triggerFileUpload} aria-label="Upload document" disabled={isSending}>
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

    