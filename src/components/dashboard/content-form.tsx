
"use client";

import { useState } from "react";
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
import { Sparkles, Tags, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(10, "Content body must be at least 10 characters"),
});

type ContentFormData = z.infer<typeof contentFormSchema>;

export function ContentForm() {
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isGeneratingHeadlines, setIsGeneratingHeadlines] = useState(false);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ContentFormData>({
    resolver: zodResolver(contentFormSchema),
  });

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

  const onSubmit: SubmitHandler<ContentFormData> = (data) => {
    console.log("Content submitted:", { ...data, generatedHeadlines, suggestedKeywords });
    // Placeholder for actual save logic
    toast({ title: "Content Saved!", description: "Your masterpiece is safe.", icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="editor">Content Editor</TabsTrigger>
          <TabsTrigger value="keywords">AI Keyword Suggester</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create New Content</CardTitle>
              <CardDescription>Craft and refine your content using the form editor. Use AI tools to enhance your work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-medium">Title</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input id="title" {...register("title")} placeholder="Your Awesome Title" className="text-base flex-grow" />
                  <Button
                    type="button"
                    onClick={handleGenerateHeadlines}
                    disabled={isGeneratingHeadlines || !contentBody}
                    variant="outline"
                    size="icon"
                    aria-label="Generate Headlines"
                  >
                    {isGeneratingHeadlines ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                {generatedHeadlines.length > 0 && (
                  <div className="mt-4 space-y-2 p-4 rounded-md bg-muted/30">
                     <h4 className="text-sm font-medium text-muted-foreground">Generated Headlines:</h4>
                    <ul className="list-disc list-inside">
                      {generatedHeadlines.map((headline, index) => (
                        <li key={index} className="text-sm">{headline}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
              <Button type="submit" size="lg">
                Save Content
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Tags className="text-primary" /> AI Keyword Suggester
              </CardTitle>
              <CardDescription>Get relevant keyword suggestions based on the content in the "Content Editor" tab.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={handleSuggestKeywords}
                disabled={isSuggestingKeywords || !contentBody}
                className="w-full"
                variant="outline"
              >
                {isSuggestingKeywords ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Tags className="mr-2 h-4 w-4" />
                )}
                Suggest Keywords for Content
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
               {suggestedKeywords.length === 0 && !isSuggestingKeywords && contentBody && (
                 <p className="text-sm text-muted-foreground text-center pt-4">Click the button above to suggest keywords based on your current content.</p>
               )}
               {!contentBody && (
                  <p className="text-sm text-muted-foreground text-center pt-4">Please write some content in the 'Content Editor' tab first to get keyword suggestions.</p>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
