
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateHeadlineOptions } from "@/ai/flows/generate-headline-options";
import { suggestRelevantKeywords } from "@/ai/flows/suggest-relevant-keywords";
import { generatePageContent } from "@/ai/flows/generate-page-content"; // Import AI flow for page content
import { Sparkles, Tags, CheckCircle, Loader2, Save, Brain } from "lucide-react"; // Added Brain icon
import { useToast } from "@/hooks/use-toast";
import type { ContentPiece } from "@/types";
import { mockContentData } from '@/lib/mock-data';
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components

const contentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(10, "Content body must be at least 10 characters"),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

interface ContentFormProps {
  initialContent?: ContentPiece;
  onFormSaved?: (savedContent: ContentPiece) => void;
}

export function ContentForm({ initialContent, onFormSaved }: ContentFormProps) {
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>(initialContent?.generatedHeadlines || []);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>(initialContent?.keywords || []);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // State for AI initial content generation
  const [isGeneratingInitialContent, setIsGeneratingInitialContent] = useState(false);
  const [showInitialContentPromptDialog, setShowInitialContentPromptDialog] = useState(false);
  const [initialContentPrompt, setInitialContentPrompt] = useState("");

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: initialContent?.title || "",
      body: initialContent?.body || "",
    }
  });

  useEffect(() => {
    if (initialContent) {
      reset({
        title: initialContent.title,
        body: initialContent.body,
      });
      setGeneratedHeadlines(initialContent.generatedHeadlines || []);
      setSuggestedKeywords(initialContent.keywords || []);
    } else {
      reset({ title: "", body: "" });
      setGeneratedHeadlines([]);
      setSuggestedKeywords([]);
    }
  }, [initialContent, reset]);

  const contentBody = watch("body");

  const handleGenerateHeadlines = async () => {
    if (!contentBody || contentBody.length < 10) {
      toast({ title: "Content too short", description: "Please write more content before generating headlines.", variant: "destructive" });
      return;
    }
    setIsGeneratingHeadlines(true);
    try {
      const result = await generateHeadlineOptions({ content: contentBody });
      setGeneratedHeadlines(result.headlines);
      toast({ title: "Headlines Generated", description: "AI has suggested new headlines." });
    } catch (error) {
      console.error("Error generating headlines:", error);
      toast({ title: "Error", description: "Failed to generate headlines.", variant: "destructive" });
    } finally {
      setIsGeneratingHeadlines(false);
    }
  };
  
  const handleUseHeadline = (headline: string) => {
    setValue("title", headline);
    toast({ title: "Headline Applied", description: "The selected headline has been applied to the title field." });
  };

  const handleSuggestKeywords = async () => {
    if (!contentBody || contentBody.length < 10) {
      toast({ title: "Content too short", description: "Please write more content before suggesting keywords.", variant: "destructive" });
      return;
    }
    setIsSuggestingKeywords(true);
    try {
      const result = await suggestRelevantKeywords({ content: contentBody });
      setSuggestedKeywords(result.keywords);
      toast({ title: "Keywords Suggested", description: "AI has suggested relevant keywords." });
    } catch (error) {
      console.error("Error suggesting keywords:", error);
      toast({ title: "Error", description: "Failed to suggest keywords.", variant: "destructive" });
    } finally {
      setIsSuggestingKeywords(false);
    }
  };

  const handleGenerateInitialContent = async () => {
    if (!initialContentPrompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a prompt for the AI.", variant: "destructive" });
      return;
    }
    setIsGeneratingInitialContent(true);
    setShowInitialContentPromptDialog(false);
    toast({ title: "AI is generating content...", description: "This may take a moment." });
    try {
      const aiResponse = await generatePageContent({ prompt: initialContentPrompt });
      setValue("title", aiResponse.pageTitle);
      const bodyContent = aiResponse.sections
        .map(section => `## ${section.sectionTitle}\n\n${section.sectionContent}`)
        .join('\n\n\n');
      setValue("body", bodyContent);
      toast({ title: "Initial Content Generated!", description: "AI has populated the title and body." });
    } catch (error) {
      console.error("Error generating initial content:", error);
      toast({ title: "AI Error", description: "Failed to generate initial content.", variant: "destructive" });
    } finally {
      setIsGeneratingInitialContent(false);
      setInitialContentPrompt(""); // Clear prompt after use
    }
  };

  const onSubmit: SubmitHandler<ContentFormData> = (data) => {
    setIsSubmitting(true);
    let savedContentPiece: ContentPiece;

    if (initialContent) {
      const index = mockContentData.findIndex(item => item.id === initialContent.id);
      if (index !== -1) {
        mockContentData[index] = {
          ...mockContentData[index],
          ...data,
          keywords: suggestedKeywords,
          generatedHeadlines: generatedHeadlines,
          updatedAt: new Date().toISOString(),
           // Ensure pageStructure is preserved if it exists, or stays undefined
          pageStructure: mockContentData[index].pageStructure,
        };
        savedContentPiece = mockContentData[index];
        toast({ title: "Content Updated!", description: "Your changes have been saved.", icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
      } else {
        toast({ title: "Error", description: "Could not find content to update.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    } else {
      const newId = String(Date.now() + Math.random());
      const newContent: ContentPiece = {
        id: newId,
        ...data,
        status: 'Draft',
        contentType: 'Form Edited Post',
        keywords: suggestedKeywords,
        generatedHeadlines: generatedHeadlines,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pageStructure: undefined,
      };
      mockContentData.push(newContent);
      savedContentPiece = newContent;
      toast({ title: "Content Saved!", description: "Your new content piece is saved.", icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
      router.push(`/dashboard/content-studio?editId=${newId}`);
    }
    
    if (onFormSaved && savedContentPiece) {
        onFormSaved(savedContentPiece);
    }
    setIsSubmitting(false);
  };
  
  const submitButtonText = initialContent ? "Update Content" : "Save New Content";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor">Content Editor</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-headline text-2xl">
                      {initialContent ? "Edit Content Details" : "Create New Content (Form)"}
                    </CardTitle>
                    <CardDescription>
                      {initialContent ? "Modify the title and body of your content." : "Use this form or let AI generate a draft for you."}
                    </CardDescription>
                  </div>
                  {!initialContent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInitialContentPromptDialog(true)}
                      disabled={isGeneratingInitialContent}
                    >
                      {isGeneratingInitialContent ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="mr-2 h-4 w-4" />
                      )}
                      Generate with AI
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-lg font-medium">Title</Label>
                  <Input id="title" {...register("title")} placeholder="Your Awesome Title" className="text-base mt-1" />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="body" className="text-lg font-medium">Content Body</Label>
                  <Textarea
                    id="body"
                    {...register("body")}
                    placeholder="Start writing your amazing content here..."
                    className="mt-1 min-h-[300px] text-base"
                  />
                  {errors.body && <p className="text-sm text-destructive mt-1">{errors.body.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" disabled={isSubmitting || isGeneratingInitialContent}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                  {submitButtonText}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tools">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="text-primary" /> AI Headline Generator
                  </CardTitle>
                  <CardDescription>Get headline suggestions based on the "Content Body".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleGenerateHeadlines}
                    disabled={isGeneratingHeadlines || !contentBody || contentBody.length < 10}
                    className="w-full"
                    variant="outline"
                  >
                    {isGeneratingHeadlines ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Headlines
                  </Button>
                  {generatedHeadlines.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Generated Headlines:</h4>
                      <ul className="space-y-1">
                        {generatedHeadlines.map((headline, index) => (
                          <li key={index} className="text-sm flex justify-between items-center">
                            <span>{headline}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleUseHeadline(headline)}>Use</Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Tags className="text-primary" /> AI Keyword Suggester
                  </CardTitle>
                  <CardDescription>Get relevant keyword suggestions based on the "Content Body".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleSuggestKeywords}
                    disabled={isSuggestingKeywords || !contentBody || contentBody.length < 10}
                    className="w-full"
                    variant="outline"
                  >
                    {isSuggestingKeywords ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Tags className="mr-2 h-4 w-4" />
                    )}
                    Suggest Keywords
                  </Button>
                  {suggestedKeywords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Suggested Keywords:</h4>
                      <div className="space-x-2 space-y-2 bg-muted/30 p-4 rounded-md">
                        {suggestedKeywords.map((keyword, index) => (
                          <span key={index} className="inline-block bg-accent text-accent-foreground text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestedKeywords.length === 0 && !isSuggestingKeywords && contentBody && contentBody.length >=10 && (
                    <p className="text-sm text-muted-foreground text-center pt-4">Click the button above to suggest keywords.</p>
                  )}
                  {(!contentBody || contentBody.length < 10) && (
                      <p className="text-sm text-muted-foreground text-center pt-4">Write at least 10 characters in 'Content Body' to get suggestions.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </form>

      <Dialog open={showInitialContentPromptDialog} onOpenChange={setShowInitialContentPromptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Initial Content with AI</DialogTitle>
            <DialogDescription>
              Describe the content you want the AI to generate. For example, "a blog post about the benefits of remote work".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="ai-prompt" className="sr-only">AI Prompt</Label>
            <Input
              id="ai-prompt"
              placeholder="e.g., An article about sustainable fashion..."
              value={initialContentPrompt}
              onChange={(e) => setInitialContentPrompt(e.target.value)}
              disabled={isGeneratingInitialContent}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isGeneratingInitialContent}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleGenerateInitialContent}
              disabled={isGeneratingInitialContent || !initialContentPrompt.trim()}
            >
              {isGeneratingInitialContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
