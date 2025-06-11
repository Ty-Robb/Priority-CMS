'use server';

/**
 * @fileOverview Suggests relevant keywords for content optimization using Vertex AI.
 *
 * - suggestRelevantKeywords - A function that suggests keywords based on content.
 * - SuggestRelevantKeywordsInput - The input type for the suggestRelevantKeywords function.
 * - SuggestRelevantKeywordsOutput - The return type for the suggestRelevantKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantKeywordsInputSchema = z.object({
  content: z
    .string()
    .describe('The content for which to suggest relevant keywords.'),
});
export type SuggestRelevantKeywordsInput = z.infer<
  typeof SuggestRelevantKeywordsInputSchema
>;

const SuggestRelevantKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of relevant keywords for the content.'),
});
export type SuggestRelevantKeywordsOutput = z.infer<
  typeof SuggestRelevantKeywordsOutputSchema
>;

export async function suggestRelevantKeywords(
  input: SuggestRelevantKeywordsInput
): Promise<SuggestRelevantKeywordsOutput> {
  return suggestRelevantKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantKeywordsPrompt',
  input: {schema: SuggestRelevantKeywordsInputSchema},
  output: {schema: SuggestRelevantKeywordsOutputSchema},
  prompt: `You are an expert in SEO and keyword research. Given the following content, suggest relevant keywords that can be used to optimize it for search engines.\n\nContent: {{{content}}}\n\nKeywords:`,
});

const suggestRelevantKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantKeywordsFlow',
    inputSchema: SuggestRelevantKeywordsInputSchema,
    outputSchema: SuggestRelevantKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
