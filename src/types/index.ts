export interface ContentPiece {
  id: string;
  title: string;
  body: string;
  keywords: string[];
  generatedHeadlines: string[];
  createdAt: string; // Using string for simplicity with Date
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document'; // Example types
  size: number; // in bytes
  uploadedAt: string;
}
