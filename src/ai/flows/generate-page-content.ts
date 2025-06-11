
'use server';
/**
 * @fileOverview Generates page content outlines using Vertex AI.
 *
 * - generatePageContent - A function that generates page content based on a prompt.
 * - GeneratePageContentInput - The input type for the generatePageContent function.
 * - GeneratePageContentOutput - The return type for the generatePageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PageSectionSchema = z.object({
  sectionTitle: z.string().describe('The title or heading for this section of the page.'),
  sectionContent: z.string().describe('The main content or body text for this section. This should be a few paragraphs long.'),
});

const GeneratePageContentInputSchema = z.object({
  prompt: z.string().describe('A description of the page to be generated, including its purpose and key elements.'),
});
export type GeneratePageContentInput = z.infer<typeof GeneratePageContentInputSchema>;

const GeneratePageContentOutputSchema = z.object({
  pageTitle: z.string().describe('A suggested title for the webpage.'),
  sections: z.array(PageSectionSchema).describe('An array of sections that make up the page content.'),
});
export type GeneratePageContentOutput = z.infer<typeof GeneratePageContentOutputSchema>;

export async function generatePageContent(input: GeneratePageContentInput): Promise<GeneratePageContentOutput> {
  return generatePageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePageContentPrompt',
  input: {schema: GeneratePageContentInputSchema},
  output: {schema: GeneratePageContentOutputSchema},
  prompt: `You are an expert web content strategist. Based on the user's prompt, generate a suitable title and a structured content outline for a webpage.
The page should be broken down into logical sections, each with a clear title and descriptive content.
For each sectionContent, provide a few paragraphs of placeholder or initial text that fits the sectionTitle and overall page prompt.

User Prompt: {{{prompt}}}

Generate the page title and sections according to the output schema.
`,
});

const generatePageContentFlow = ai.defineFlow(
  {
    name: 'generatePageContentFlow',
    inputSchema: GeneratePageContentInputSchema,
    outputSchema: GeneratePageContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

