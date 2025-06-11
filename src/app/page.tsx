import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Edit3, Zap, Aperture } from 'lucide-react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

export default function HomePage() {
  const features = [
    {
      icon: <Edit3 className="h-8 w-8 text-primary" />,
      title: 'Intuitive Content Editor',
      description: 'Craft and refine your content with a simple yet powerful WYSIWYG editor.',
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Headlines',
      description: 'Generate compelling headline options instantly with Vertex AI.',
    },
    {
      icon: <Aperture className="h-8 w-8 text-primary" />,
      title: 'Smart Keyword Suggestions',
      description: 'Optimize your content for search engines with AI-driven keyword recommendations.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Simple Media Management',
      description: 'Easily upload and manage your images and documents within the platform.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center">
          <Logo />
          <div className="space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="py-16 md:py-24 lg:py-32 text-center bg-gradient-to-b from-background to-accent/10">
          <div className="container mx-auto px-4">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-primary">
              VertexCMS: Content Creation, Reimagined
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Empower your content strategy with AI-driven tools and a seamless editing experience. VertexCMS helps you create, optimize, and manage your digital content effortlessly.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Get Started For Free</Link>
            </Button>
            <div className="mt-16">
              <Image 
                src="https://placehold.co/1200x600.png" 
                alt="VertexCMS Dashboard Preview" 
                width={1200} 
                height={600}
                className="rounded-lg shadow-2xl mx-auto"
                data-ai-hint="dashboard interface"
              />
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-center mb-12 text-primary">
              Features That Empower You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mb-4 flex justify-center">{feature.icon}</div>
                    <CardTitle className="font-headline text-xl text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} VertexCMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
