'use server';

/**
 * @fileOverview Generates alternative headline options for content using Vertex AI.
 *
 * - generateHeadlineOptions - A function that generates headline options.
 * - GenerateHeadlineOptionsInput - The input type for the generateHeadlineOptions function.
 * - GenerateHeadlineOptionsOutput - The return type for the generateHeadlineOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeadlineOptionsInputSchema = z.object({
  content: z.string().describe('The content for which to generate headline options.'),
});
export type GenerateHeadlineOptionsInput = z.infer<typeof GenerateHeadlineOptionsInputSchema>;

const GenerateHeadlineOptionsOutputSchema = z.object({
  headlines: z.array(z.string()).describe('An array of alternative headline options.'),
});
export type GenerateHeadlineOptionsOutput = z.infer<typeof GenerateHeadlineOptionsOutputSchema>;

export async function generateHeadlineOptions(input: GenerateHeadlineOptionsInput): Promise<GenerateHeadlineOptionsOutput> {
  return generateHeadlineOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHeadlineOptionsPrompt',
  input: {schema: GenerateHeadlineOptionsInputSchema},
  output: {schema: GenerateHeadlineOptionsOutputSchema},
  prompt: `You are an expert copywriter specializing in generating engaging headlines.

  Generate 5 alternative headline options for the following content:

  Content: {{{content}}}

  Format each headline on a new line.
  `,
});

const generateHeadlineOptionsFlow = ai.defineFlow(
  {
    name: 'generateHeadlineOptionsFlow',
    inputSchema: GenerateHeadlineOptionsInputSchema,
    outputSchema: GenerateHeadlineOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
