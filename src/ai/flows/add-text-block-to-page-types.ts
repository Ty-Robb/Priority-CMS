
/**
 * @fileOverview Zod schemas and TypeScript types for the addTextBlockToPage flow.
 */
import { z } from 'genkit';
import { PageStructureSchema } from '@/ai/schemas/page-structure-zod-schemas';

export const AddTextBlockToPageInputSchema = z.object({
  currentPageStructure: PageStructureSchema.describe("The current structure of the page as a JSON object."),
  paragraphText: z.string().describe("The text content for the new paragraph to be added."),
});
export type AddTextBlockToPageInput = z.infer<typeof AddTextBlockToPageInputSchema>;

export const AddTextBlockToPageOutputSchema = z.object({
  updatedPageStructure: PageStructureSchema.describe("The modified page structure with the new text block appended."),
});
export type AddTextBlockToPageOutput = z.infer<typeof AddTextBlockToPageOutputSchema>;
