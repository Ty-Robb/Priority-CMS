
export interface ContentPiece {
  id: string;
  title: string;
  body: string;
  status: 'Draft' | 'Published' | 'Archived';
  contentType: string; // Added to support different content types
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
  dataAiHint?: string; 
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string; // ISO 8601 date string
}

// Visual Editor Types
export type VisualBlockType = 'text' | 'image' | 'container' | 'button';

export interface TextBlockProps {
  text: string;
  level?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Optional: for semantic text
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  dataAiHint?: string;
}

export interface ButtonBlockProps {
  text: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  href?: string; // Optional: for navigation
}

export interface ContainerBlockProps {
  // Currently no specific props, used for grouping.
  // Could add layout props like flexDirection, alignItems, justifyContent later.
}

export type VisualBlockPropsUnion = TextBlockProps | ImageBlockProps | ButtonBlockProps | ContainerBlockProps;

export interface VisualBlock {
  id: string;
  type: VisualBlockType;
  props: VisualBlockPropsUnion;
  children?: VisualBlock[];
}

export interface PageStructure {
  id: string;
  title: string;
  blocks: VisualBlock[];
}
