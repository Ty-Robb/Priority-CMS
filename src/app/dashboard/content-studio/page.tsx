import { ContentForm } from '@/components/dashboard/content-form';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContentStudioPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h1 className="font-headline text-3xl font-bold text-primary mb-8">Content Studio</h1>
        <ContentForm />
      </div>
      <div className="lg:col-span-1">
        <Card className="mt-0 lg:mt-[calc(3rem+2rem+1.5rem)]"> {/* Approximate height of h1 + mb */}
          <CardHeader>
            <CardTitle className="font-headline text-xl">AI Content Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
