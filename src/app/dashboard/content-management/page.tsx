
"use client";

import { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react"; // Added Trash2 icon
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
import { mockContentData } from '@/lib/mock-data'; // Import centralized mock data
import { useToast } from '@/hooks/use-toast'; // Added useToast

export default function ContentManagementPage() {
  const [contentList, setContentList] = useState<ContentPiece[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast(); // Initialize toast

  const loadContent = useCallback(() => {
    // Ensure we get the latest version of mockContentData
    // For this prototype, directly assigning is fine as mutations are on the imported array.
    // In a real app, this would be a fetch call.
    setContentList([...mockContentData]);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadContent();
  }, [loadContent]);

  // Re-load content if mockContentData might have changed, e.g. after navigation
  // This is a common pattern if data can be mutated on other pages.
  useEffect(() => {
    if (mounted) {
        const handleFocus = () => loadContent();
        window.addEventListener('focus', handleFocus); // Reload when tab gets focus
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }
  }, [mounted, loadContent]);


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

  const handleDeleteContent = (contentId: string) => {
    if (window.confirm("Are you sure you want to delete this content piece? This action cannot be undone.")) {
      const indexToDelete = mockContentData.findIndex(content => content.id === contentId);
      if (indexToDelete !== -1) {
        mockContentData.splice(indexToDelete, 1);
        loadContent(); // Reload content to update the list
        toast({
          title: "Content Deleted",
          description: "The content piece has been successfully deleted.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Could not find the content piece to delete.",
          variant: "destructive"
        });
      }
    }
  };


  if (!mounted) {
    // Basic loading state to avoid hydration mismatch for dates
    return (
       <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Loading content...</p>
      </div>
    );
  }

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
                           <DropdownMenuItem asChild>
                            <Link href={`/blog/${content.id}`}>View Post</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/content-studio?editId=${content.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
