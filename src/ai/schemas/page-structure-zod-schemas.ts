
'use server';
/**
 * @fileOverview Zod schemas for representing the visual page structure.
 * These schemas are used by Genkit flows to ensure type safety and guide AI models.
 */

import { z } from 'zod';
import type { VisualBlock, PageStructure, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps, ListBlockProps, QuoteBlockProps, ListItemType } from '@/types';

// Props Schemas
export const TextBlockPropsSchema: z.ZodType<TextBlockProps> = z.object({
  text: z.string().describe("The actual text content for the block."),
  level: z.enum(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']).optional().describe("The semantic heading level or paragraph type."),
});

export const ImageBlockPropsSchema: z.ZodType<ImageBlockProps> = z.object({
  src: z.string().url().describe("The URL source of the image."),
  alt: z.string().describe("Alternative text for the image, for accessibility."),
  width: z.number().optional().describe("Optional width of the image."),
  height: z.number().optional().describe("Optional height of the image."),
  dataAiHint: z.string().optional().describe("Optional AI hint for image search or generation."),
});

export const ButtonBlockPropsSchema: z.ZodType<ButtonBlockProps> = z.object({
  text: z.string().describe("The text displayed on the button."),
  variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']).optional().describe("The visual style variant of the button."),
  href: z.string().url().optional().describe("Optional URL if the button is a link."),
});

export const ContainerBlockPropsSchema: z.ZodType<ContainerBlockProps> = z.object({
  // No specific props for container yet, it's for grouping.
  // Potentially add layout props like flexDirection, gap, etc. in the future.
}).describe("Properties for a container block, used for grouping other blocks.");

export const ListItemSchema: z.ZodType<ListItemType> = z.object({
    id: z.string().describe("Unique identifier for the list item."),
    text: z.string().describe("Text content of the list item."),
});

export const ListBlockPropsSchema: z.ZodType<ListBlockProps> = z.object({
  items: z.array(ListItemSchema).describe("An array of list items."),
  ordered: z.boolean().describe("True if the list is ordered (ol), false for unordered (ul)."),
});

export const QuoteBlockPropsSchema: z.ZodType<QuoteBlockProps> = z.object({
  text: z.string().describe("The main text of the quotation."),
  citation: z.string().optional().describe("Optional citation or source of the quote."),
});

// Union of all possible block props
export const VisualBlockPropsUnionSchema = z.union([
  TextBlockPropsSchema,
  ImageBlockPropsSchema,
  ButtonBlockPropsSchema,
  ContainerBlockPropsSchema,
  ListBlockPropsSchema,
  QuoteBlockPropsSchema,
]).describe("A union of all possible property types for visual blocks.");

// Recursive VisualBlock Schema
// Needs z.lazy because VisualBlockSchema references itself via the 'children' property.
export const VisualBlockSchema: z.ZodType<VisualBlock> = z.lazy(() =>
  z.object({
    id: z.string().describe("A unique identifier for this specific block instance."),
    type: z.enum(['text', 'image', 'container', 'button', 'list', 'quote']).describe("The type of visual block (e.g., text, image)."),
    props: VisualBlockPropsUnionSchema.describe("The properties specific to this block type."),
    children: z.array(VisualBlockSchema).optional().describe("Optional array of child blocks, used by 'container' type blocks."),
  })
);

// PageStructure Schema
export const PageStructureSchema: z.ZodType<PageStructure> = z.object({
  id: z.string().describe("A unique identifier for the entire page structure."),
  title: z.string().describe("The main title of the page."),
  blocks: z.array(VisualBlockSchema).describe("An array of visual blocks that make up the content of the page."),
});
