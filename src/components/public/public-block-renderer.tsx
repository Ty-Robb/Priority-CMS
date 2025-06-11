
"use client";

import React from 'react';
import type { VisualBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps, ListBlockProps, QuoteBlockProps, ListItemType } from '@/types';
import Image from 'next/image';
import { Button as ShadCnButton } from '@/components/ui/button';

interface PublicBlockRendererProps {
  block: VisualBlock;
}

export function PublicBlockRenderer({ block }: PublicBlockRendererProps) {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'text': {
        const props = block.props as TextBlockProps;
        const Tag = props.level || 'p';
        const classNames = `my-2 ${Tag !== 'p' ? 'font-bold' : ''} ${
          Tag === 'h1' ? 'text-4xl md:text-5xl' :
          Tag === 'h2' ? 'text-3xl md:text-4xl' :
          Tag === 'h3' ? 'text-2xl md:text-3xl' :
          Tag === 'h4' ? 'text-xl md:text-2xl' :
          Tag === 'h5' ? 'text-lg md:text-xl' :
          Tag === 'h6' ? 'text-base md:text-lg' :
          'text-base leading-relaxed' // Paragraph specific
        }`;
        // For multiline text, split by newline and render each as a separate paragraph or handle within the tag
        if (Tag === 'p' && props.text.includes('\\n')) {
          return props.text.split('\\n').map((paragraph, index) => (
            <p key={index} className={`${classNames} mb-4 last:mb-0`}>
              {paragraph.trim()}
            </p>
          ));
        }
        return <Tag className={classNames}>{props.text}</Tag>;
      }
      case 'image': {
        const props = block.props as ImageBlockProps;
        return (
          <div className="my-4">
            <Image
              src={props.src || `https://placehold.co/${props.width || 600}x${props.height || 400}.png`}
              alt={props.alt || 'Placeholder image'}
              width={props.width || 800} // Default to a larger width for blog images
              height={props.height || 450}
              className="rounded-lg shadow-md object-cover mx-auto" // Center images
              data-ai-hint={props.dataAiHint || "placeholder image"}
            />
          </div>
        );
      }
      case 'button': {
        const props = block.props as ButtonBlockProps;
        if (props.href) {
          return (
            <div className="my-4 text-center"> {/* Center button */}
              <ShadCnButton variant={props.variant || 'default'} asChild>
                <a href={props.href} target="_blank" rel="noopener noreferrer">{props.text}</a>
              </ShadCnButton>
            </div>
          );
        }
        return (
          <div className="my-4 text-center"> {/* Center button */}
            <ShadCnButton variant={props.variant || 'default'}>
              {props.text}
            </ShadCnButton>
          </div>
        );
      }
      case 'container': {
        // Ensure props is correctly typed if it were to have specific container props
        // const props = block.props as ContainerBlockProps; 
        return (
          <div className="my-2 py-2"> {/* Simple div, no explicit styling unless props define it */}
            {block.children && block.children.map(childBlock => (
              <PublicBlockRenderer key={childBlock.id} block={childBlock} />
            ))}
          </div>
        );
      }
      case 'list': {
        const props = block.props as ListBlockProps;
        const ListTag = props.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`my-4 pl-6 md:pl-8 ${props.ordered ? 'list-decimal' : 'list-disc'} space-y-1 text-base leading-relaxed`}>
            {props.items.map((item: ListItemType) => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ListTag>
        );
      }
      case 'quote': {
        const props = block.props as QuoteBlockProps;
        return (
          <blockquote className="my-6 p-4 border-l-4 border-primary bg-muted/30 rounded-r-md italic text-lg">
            <p className="mb-2 leading-relaxed">{props.text}</p>
            {props.citation && (
              <footer className="text-base text-muted-foreground mt-2">
                <cite>— {props.citation}</cite>
              </footer>
            )}
          </blockquote>
        );
      }
      default:
        return <div className="p-2 my-2 border border-red-500 rounded-md bg-red-50 text-red-700">Unsupported block type: {(block as any).type}</div>;
    }
  };

  return <div className="mb-2">{renderBlockContent()}</div>;
}
