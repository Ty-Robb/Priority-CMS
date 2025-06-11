import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Image as ImageIcon, Sparkles } from "lucide-react";

export default function DashboardHomePage() {
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">Welcome to VertexCMS Dashboard</h1>
      <p className="text-muted-foreground text-lg">
        Manage your content, generate AI-powered insights, and streamline your workflow.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-headline">Content Studio</CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create, edit, and enhance your articles with AI-powered headline and keyword suggestions.
            </CardDescription>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/content-studio">Go to Content Studio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-headline">Media Library</CardTitle>
            <ImageIcon className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload, organize, and manage your images and other media assets efficiently.
            </CardDescription>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/media">Manage Media</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-headline">AI Tools</CardTitle>
            <Sparkles className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Leverage Vertex AI to generate creative headlines and discover relevant keywords.
            </CardDescription>
            <Button asChild variant="outline" className="mt-4 w-full">
               <Link href="/dashboard/content-studio">Explore AI Features</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future content stats or recent activity */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
