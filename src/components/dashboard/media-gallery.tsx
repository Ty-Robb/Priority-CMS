
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Trash2, FileText, Image as ImageIconLucide, Loader2 } from 'lucide-react';
import type { MediaFile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase'; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { useAuth } from '@/contexts/auth-context'; // To get user ID for namespacing

// Remove initialMedia as data will come from Firebase Storage
// const initialMedia: MediaFile[] = [ ... ];


export function MediaGallery() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const getStoragePath = () => {
    // Use user ID for namespacing if available, otherwise a generic path
    // In a real app, you'd enforce user-specific paths more strictly
    return user ? `media/${user.uid}` : 'media/public';
  };

  // Fetch media files from Firebase Storage
  const fetchMedia = async () => {
    if (!storage || !user) { // Ensure user is available for user-specific paths
        setIsLoadingMedia(false); // Stop loading if no user or storage
        return;
    }
    setIsLoadingMedia(true);
    const storagePath = getStoragePath();
    const listRef = ref(storage, storagePath);

    try {
      const res = await listAll(listRef);
      const filesPromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        // Attempt to get metadata for more info if needed, e.g. custom metadata for size/type
        // For simplicity, we'll derive type from name and use placeholder size.
        return {
          id: itemRef.name, // Using name as ID, could be more robust
          name: itemRef.name,
          url,
          type: itemRef.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null ? 'image' : 'document',
          size: 0, // Firebase Storage doesn't easily provide size in listAll, need metadata or store separately
          uploadedAt: new Date().toISOString(), // Placeholder, ideally store upload date in metadata or DB
          dataAiHint: itemRef.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null ? 'uploaded image' : 'uploaded document',
        } as MediaFile;
      });
      const files = await Promise.all(filesPromises);
      setMediaFiles(files);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({ title: "Error", description: "Could not load media files.", variant: "destructive" });
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    if(user){ // Only fetch media if user is logged in
        fetchMedia();
    } else {
        setMediaFiles([]); // Clear media files if user logs out
        setIsLoadingMedia(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Refetch if user changes

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a file to upload.", variant: "destructive"});
      return;
    }
    if (!storage) {
      toast({ title: "Storage Error", description: "Firebase Storage is not initialized.", variant: "destructive"});
      return;
    }
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to upload files.", variant: "destructive"});
      return;
    }
    setIsUploading(true);
    const storagePath = getStoragePath();
    const fileRef = ref(storage, `${storagePath}/${Date.now()}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Optional: handle progress
        // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error("Upload error:", error);
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        // Upload completed successfully
        await fetchMedia(); // Refresh the list
        setSelectedFile(null);
        setIsUploading(false);
        toast({ title: "File Uploaded", description: `${selectedFile.name} has been uploaded.`});
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    );
  };

  const handleDelete = async (fileName: string) => {
    if (!storage || !user) return;
    if (!window.confirm(\`Are you sure you want to delete ${fileName}?\`)) return;

    const storagePath = getStoragePath();
    const fileRef = ref(storage, `${storagePath}/${fileName}`);
    try {
      await deleteObject(fileRef);
      setMediaFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
      toast({ title: "File Deleted", description: `${fileName} has been removed.`, variant: "destructive"});
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    }
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
          <Input id="file-upload" type="file" onChange={handleFileChange} className="flex-grow" disabled={isUploading || !user}/>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading || !user} className="w-full sm:w-auto">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
             {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </CardContent>
         {!user && <p className="text-sm text-muted-foreground p-4 text-center">Please log in to upload and manage media.</p>}
      </Card>

      <div>
        <h2 className="font-headline text-xl mb-4">Your Media</h2>
        {isLoadingMedia ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Loading media...</p>
          </div>
        ) : !user ? (
            <p className="text-muted-foreground text-center py-8">Log in to view your media files.</p>
        ) : mediaFiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No media files yet. Upload some!</p>
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
                    data-ai-hint={file.dataAiHint || "placeholder image"}
                    unoptimized // Useful if Firebase Storage URLs don't have cache headers recognized by Next/Image
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
                    {/* <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB 
                    </p> */}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(file.name)}
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
