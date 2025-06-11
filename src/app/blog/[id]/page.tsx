
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ContentPiece } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { mockContentData } from '@/lib/mock-data'; // Import centralized mock data

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<ContentPiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && params.id) {
      const postId = params.id as string;
      // Simulate fetching data
      const foundPost = mockContentData.find(p => p.id === postId);
      if (foundPost) {
        setPost(foundPost);
      }
      setIsLoading(false);
    }
  }, [params.id, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <p>Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The blog post you are looking for could not be found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Basic rendering for body text - split by newlines for paragraphs
  const bodyParagraphs = post.body.split('\\n\\n');

  return (
    <div className="bg-background min-h-screen">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="font-headline text-2xl font-bold text-primary">VertexCMS Blog</h1>
             <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
          </Button>
          
          <Card className="overflow-hidden shadow-lg">
             <Image 
                src={`https://placehold.co/1200x600.png?text=${encodeURIComponent(post.title)}`}
                alt={post.title}
                width={1200}
                height={600}
                className="w-full object-cover"
                data-ai-hint="blog header"
              />
            <CardHeader className="p-6">
              <CardTitle className="font-headline text-4xl font-bold text-primary mb-2">
                {post.title}
              </CardTitle>
              <div className="text-sm text-muted-foreground mb-4 space-x-2">
                <span>Published on {new Date(post.createdAt).toLocaleDateString()}</span>
                <span>&bull;</span>
                <span>{post.contentType}</span>
              </div>
               {post.keywords && post.keywords.length > 0 && (
                <div className="mb-4">
                  {post.keywords.map(keyword => (
                    <span key={keyword} className="inline-block bg-accent text-accent-foreground text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 prose prose-lg max-w-none dark:prose-invert">
              {bodyParagraphs.map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        </article>
      </main>
       <footer className="py-8 text-center border-t mt-12">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} VertexCMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
