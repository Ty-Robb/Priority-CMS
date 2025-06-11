
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
  pageStructure?: PageStructure; // Optional: For rich content editing
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
export type VisualBlockType = 'text' | 'image' | 'container' | 'button' | 'list' | 'quote';

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

export interface ListItemType {
  id: string;
  text: string;
}

export interface ListBlockProps {
  items: ListItemType[];
  ordered: boolean; // true for <ol>, false for <ul>
}

export interface QuoteBlockProps {
  text: string;
  citation?: string;
}

export type VisualBlockPropsUnion =
  | TextBlockProps
  | ImageBlockProps
  | ButtonBlockProps
  | ContainerBlockProps
  | ListBlockProps
  | QuoteBlockProps;

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
