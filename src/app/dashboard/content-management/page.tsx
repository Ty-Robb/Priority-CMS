
"use client";

import { useState, useEffect } from 'react';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ContentPiece } from "@/types";
import Link from 'next/link';

const mockContent: ContentPiece[] = [
  {
    id: "1",
    title: "The Future of AI in Content Creation",
    status: "Published",
    contentType: "Blog Post",
    keywords: ["AI", "content", "future"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    body: "This is the body of the article...",
  },
  {
    id: "2",
    title: "Top 10 React Best Practices",
    status: "Draft",
    contentType: "Technical Article",
    keywords: ["React", "best practices", "development"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    body: "This is the body of the article...",
  },
  {
    id: "3",
    title: "About Us - Our Company Story",
    status: "Published",
    contentType: "Page",
    keywords: ["company", "about", "mission"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    body: "This is the body of the article...",
  },
  {
    id: "4",
    title: "Understanding Server Components - A Deep Dive",
    status: "Archived",
    contentType: "Blog Post",
    keywords: ["Server Components", "React", "Next.js"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    body: "This is the body of the article...",
  },
  {
    id: "5",
    title: "Project Alpha Showcase",
    status: "Published",
    contentType: "Portfolio Item",
    keywords: ["case study", "project", "design"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    body: "Detailed description of Project Alpha...",
  },
];


export default function ContentManagementPage() {
  const [contentList, setContentList] = useState<ContentPiece[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In a real app, you'd fetch this data from your backend
    setContentList(mockContent);
  }, []);

  if (!mounted) {
    // Basic loading state to avoid hydration mismatch for dates
    return <p>Loading content...</p>; 
  }

  const getStatusVariant = (status: ContentPiece['status']) => {
    switch (status) {
      case 'Published':
        return 'default';
      case 'Draft':
        return 'secondary';
      case 'Archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold text-primary">Content Management</h1>
        <Button asChild>
          <Link href="/dashboard/content-studio">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Content
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Content Pieces</CardTitle>
          <CardDescription>
            Manage, edit, and view all your created content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Last Updated
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Created At
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No content created yet.
                  </TableCell>
                </TableRow>
              ) : (
                contentList.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>{content.contentType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(content.status)}>
                        {content.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
