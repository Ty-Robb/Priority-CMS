
"use client";

import type { KeyboardEvent} from 'react';
import React, { useState, useEffect } from 'react';
import type { VisualBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps, ListBlockProps, QuoteBlockProps, ListItemType, VisualBlockPropsUnion, PageStructure } from '@/types';
import Image from 'next/image';
import { Button as ShadCnButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CanvasBlockRendererProps {
  block: VisualBlock;
  onUpdateBlock: (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => void;
  pageStructure: PageStructure; // Full page structure for context if needed
  onUpdatePageStructure: (updatedPage: PageStructure) => void; // To update the whole page
}

export function CanvasBlockRenderer({ block, onUpdateBlock, pageStructure, onUpdatePageStructure }: CanvasBlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Local state for text-like content to avoid direct prop mutation issues during edit
  const [editableContent, setEditableContent] = useState(''); 

  useEffect(() => {
    // Initialize editableContent when block changes or editing starts
    if (block.type === 'text') {
      setEditableContent((block.props as TextBlockProps).text);
    }
    // Add other block types here if they become editable
  }, [block.props, block.type]);


  const handleDoubleClick = () => {
    if (block.type === 'text') { // Only enable for text blocks for now
      setIsEditing(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditableContent(event.target.value);
  };

  const handleBlur = () => {
    if (block.type === 'text') {
      const currentProps = block.props as TextBlockProps;
      if (currentProps.text !== editableContent) {
        onUpdateBlock(block.id, { text: editableContent } as Partial<TextBlockProps>);
      }
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && block.type === 'text') { // For textarea, Enter alone submits
      event.preventDefault(); // Prevent newline in input if it's not a textarea
      handleBlur();
    } else if (event.key === 'Escape') {
       if (block.type === 'text') {
        setEditableContent((block.props as TextBlockProps).text); // Revert
      }
      setIsEditing(false);
    }
  };


  switch (block.type) {
    case 'text': {
      const props = block.props as TextBlockProps;
      const Tag = props.level || 'p';
      if (isEditing) {
        if (Tag === 'p' || Tag === 'h4' || Tag === 'h5' || Tag === 'h6') {
           return (
            <Textarea
              value={editableContent}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`my-2 w-full min-h-[60px] resize-none text-base ${Tag !== 'p' ? 'font-bold' : ''} ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : '' }`}
              autoFocus
            />
          );
        }
        return ( // Use input for headings h1-h3 for single line editing
            <Input
              type="text"
              value={editableContent}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={`my-2 w-full font-bold ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : '' }`}
              autoFocus
            />
        );
      }
      return (
        <Tag 
          onDoubleClick={handleDoubleClick} 
          title="Double-click to edit"
          className={`my-2 cursor-pointer hover:bg-muted/30 ${Tag !== 'p' ? 'font-bold' : ''} ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : '' }`}
        >
          {props.text}
        </Tag>
      );
    }
    case 'image': {
      const props = block.props as ImageBlockProps;
      return (
        <div className="my-4">
          <Image
            src={props.src || `https://placehold.co/${props.width || 600}x${props.height || 400}.png`}
            alt={props.alt || 'Placeholder image'}
            width={props.width || 600}
            height={props.height || 400}
            className="rounded-md shadow-md object-cover"
            data-ai-hint={props.dataAiHint || "placeholder image"}
          />
        </div>
      );
    }
    case 'button': {
      const props = block.props as ButtonBlockProps;
      if (props.href) {
        return (
          <ShadCnButton variant={props.variant || 'default'} className="my-2" asChild>
            <a href={props.href} target="_blank" rel="noopener noreferrer">{props.text}</a>
          </ShadCnButton>
        );
      }
      return (
        <ShadCnButton variant={props.variant || 'default'} className="my-2">
          {props.text}
        </ShadCnButton>
      );
    }
    case 'container': {
      return (
        <div className="my-2 p-4 border border-dashed border-muted rounded-md">
          {block.children && block.children.map(childBlock => (
            <CanvasBlockRenderer 
              key={childBlock.id} 
              block={childBlock} 
              onUpdateBlock={onUpdateBlock}
              pageStructure={pageStructure}
              onUpdatePageStructure={onUpdatePageStructure}
            />
          ))}
        </div>
      );
    }
    case 'list': {
      const props = block.props as ListBlockProps;
      const ListTag = props.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`my-2 pl-5 ${props.ordered ? 'list-decimal' : 'list-disc'}`}>
          {props.items.map((item: ListItemType) => (
            <li key={item.id} className="mb-1">{item.text}</li>
          ))}
        </ListTag>
      );
    }
    case 'quote': {
      const props = block.props as QuoteBlockProps;
      return (
        <blockquote className="my-4 p-4 border-l-4 border-primary bg-muted/50 rounded-r-md italic">
          <p className="mb-2">{props.text}</p>
          {props.citation && (
            <footer className="text-sm text-muted-foreground">
              <cite>— {props.citation}</cite>
            </footer>
          )}
        </blockquote>
      );
    }
    default:
      return <div className="p-2 my-2 border border-red-500 rounded-md bg-red-50 text-red-700">Unknown block type: {block.type}</div>;
  }
}
