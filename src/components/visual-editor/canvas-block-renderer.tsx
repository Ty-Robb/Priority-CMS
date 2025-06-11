
"use client";

import type { VisualBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps } from '@/types';
import Image from 'next/image';
import { Button as ShadCnButton } from '@/components/ui/button'; // Renamed to avoid conflict

interface CanvasBlockRendererProps {
  block: VisualBlock;
}

export function CanvasBlockRenderer({ block }: CanvasBlockRendererProps) {
  switch (block.type) {
    case 'text': {
      const props = block.props as TextBlockProps;
      const Tag = props.level || 'p';
      return <Tag className={`my-2 ${Tag !== 'p' ? 'font-bold' : ''} ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : '' }`}>{props.text}</Tag>;
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
      // const props = block.props as ContainerBlockProps; // No specific props for now
      return (
        <div className="my-2 p-4 border border-dashed border-muted rounded-md">
          {block.children && block.children.map(childBlock => (
            <CanvasBlockRenderer key={childBlock.id} block={childBlock} />
          ))}
        </div>
      );
    }
    default:
      // console.warn("Unknown block type:", block.type);
      return <div className="p-2 my-2 border border-red-500 rounded-md bg-red-50 text-red-700">Unknown block type: {block.type}</div>;
  }
}
