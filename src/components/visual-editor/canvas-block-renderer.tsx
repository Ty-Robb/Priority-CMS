
"use client";

import type { KeyboardEvent} from 'react';
import React, { useState, useEffect } from 'react';
import type { VisualBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps, ListBlockProps, QuoteBlockProps, ListItemType, VisualBlockPropsUnion, PageStructure } from '@/types';
import Image from 'next/image';
import { Button as ShadCnButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // Optional: for a drag handle

interface CanvasBlockRendererProps {
  block: VisualBlock;
  onUpdateBlock: (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => void;
  pageStructure: PageStructure; 
  onUpdatePageStructure: (updatedPage: PageStructure) => void; 
}

export function CanvasBlockRenderer({ block, onUpdateBlock, pageStructure, onUpdatePageStructure }: CanvasBlockRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(''); 

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: block.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
    position: 'relative' as 'relative', // Added for positioning drag handle
  };

  useEffect(() => {
    if (block.type === 'text') {
      setEditableContent((block.props as TextBlockProps).text);
    }
  }, [block.props, block.type]);


  const handleDoubleClick = () => {
    if (block.type === 'text') { 
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
    if (event.key === 'Enter' && !event.shiftKey && block.type === 'text') { 
      event.preventDefault(); 
      handleBlur();
    } else if (event.key === 'Escape') {
       if (block.type === 'text') {
        setEditableContent((block.props as TextBlockProps).text); 
      }
      setIsEditing(false);
    }
  };

  const renderBlockContent = () => {
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
          return ( 
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
              // Note: Dragging children within a container is not yet supported by this setup
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

  return (
    <div ref={setNodeRef} style={style} className="mb-2 relative group bg-background p-2 rounded hover:shadow-md transition-shadow">
       <button 
        {...attributes} 
        {...listeners}
        className="absolute top-1/2 -left-3 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        aria-label="Drag to reorder block"
      >
        <GripVertical size={18} />
      </button>
      {renderBlockContent()}
    </div>
  );
}
