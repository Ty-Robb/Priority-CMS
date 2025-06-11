"use client";

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Trash2, FileText, Image as ImageIconLucide } from 'lucide-react';
import type { MediaFile } from '@/types';
import { useToast } from '@/hooks/use-toast';

const initialMedia: MediaFile[] = [
  { id: '1', name: 'Abstract Background.jpg', url: 'https://placehold.co/600x400.png', type: 'image', size: 1024 * 500, uploadedAt: new Date().toISOString() , dataAiHint: "abstract background" },
  { id: '2', name: 'Company Logo.png', url: 'https://placehold.co/400x400.png', type: 'image', size: 1024 * 120, uploadedAt: new Date().toISOString(), dataAiHint: "company logo" },
  { id: '3', name: 'Marketing Report.pdf', url: 'https://placehold.co/600x800.png', type: 'document', size: 1024 * 1200, uploadedAt: new Date().toISOString(), dataAiHint: "document icon" },
  { id: '4', name: 'Product Shot.jpeg', url: 'https://placehold.co/600x450.png', type: 'image', size: 1024 * 750, uploadedAt: new Date().toISOString(), dataAiHint: "product photography" },
];


export function MediaGallery() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialMedia.map(m => ({...m, url: `${m.url}?id=${m.id}`}))); // Add unique query to placeholder to ensure different images load
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive"});
      return;
    }
    // Simulate upload
    const newFile: MediaFile = {
      id: String(Date.now()),
      name: selectedFile.name,
      url: URL.createObjectURL(selectedFile), // For local preview
      type: selectedFile.type.startsWith('image/') ? 'image' : 'document',
      size: selectedFile.size,
      uploadedAt: new Date().toISOString(),
    };
    setMediaFiles(prevFiles => [newFile, ...prevFiles]);
    setSelectedFile(null); // Reset file input
    toast({ title: "File Uploaded", description: `${newFile.name} has been uploaded.`});
    // Clear the actual input field value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";

  };

  const handleDelete = (fileId: string) => {
    setMediaFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    toast({ title: "File Deleted", description: "The file has been removed.", variant: "destructive"});
  };
  
  const getFileIcon = (fileType: 'image' | 'document') => {
    if (fileType === 'image') return <ImageIconLucide className="h-10 w-10 text-primary" />;
    return <FileText className="h-10 w-10 text-primary" />;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Upload New Media</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Input id="file-upload" type="file" onChange={handleFileChange} className="flex-grow" />
          <Button onClick={handleUpload} disabled={!selectedFile} className="w-full sm:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-headline text-xl mb-4">Your Media</h2>
        {mediaFiles.length === 0 ? (
          <p className="text-muted-foreground">No media files yet. Upload some!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaFiles.map(file => (
              <Card key={file.id} className="overflow-hidden group relative">
                <CardContent className="p-0">
                {file.type === 'image' ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={300}
                    height={200}
                    className="aspect-[3/2] w-full object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={(file as any).dataAiHint || "placeholder image"}
                  />
                ) : (
                  <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}
                </CardContent>
                <CardFooter className="p-3 bg-background/80 backdrop-blur-sm">
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(file.id)}
                    aria-label={`Delete ${file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
