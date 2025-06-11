
'use server';
/**
 * @fileOverview A Genkit flow to add a new text block (paragraph) to an existing page structure.
 *
 * - addTextBlockToPage - A function that takes the current page structure and new paragraph text,
 *   and returns the updated page structure with the new paragraph appended.
 * - AddTextBlockToPageInput - The input type for the addTextBlockToPage function.
 * - AddTextBlockToPageOutput - The return type for the addTextBlockToPage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PageStructureSchema, VisualBlockSchema } from '@/ai/schemas/page-structure-zod-schemas';
import type { PageStructure } from '@/types';

export const AddTextBlockToPageInputSchema = z.object({
  currentPageStructure: PageStructureSchema.describe("The current structure of the page as a JSON object."),
  paragraphText: z.string().describe("The text content for the new paragraph to be added."),
});
export type AddTextBlockToPageInput = z.infer<typeof AddTextBlockToPageInputSchema>;

export const AddTextBlockToPageOutputSchema = z.object({
  updatedPageStructure: PageStructureSchema.describe("The modified page structure with the new text block appended."),
});
export type AddTextBlockToPageOutput = z.infer<typeof AddTextBlockToPageOutputSchema>;


export async function addTextBlockToPage(input: AddTextBlockToPageInput): Promise<AddTextBlockToPageOutput> {
  // The Genkit flow will handle the core logic with the LLM.
  // Here, we generate a unique ID that the LLM will be instructed to use.
  const newBlockId = `block-text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const result = await addTextBlockToPageInternalFlow({
    currentPageStructure: input.currentPageStructure,
    paragraphText: input.paragraphText,
    newBlockId: newBlockId, // Pass the generated ID to the flow that calls the prompt
  });
  return result;
}

// Internal schema that includes the newBlockId for the prompt
const InternalFlowInputSchema = AddTextBlockToPageInputSchema.extend({
    newBlockId: z.string().describe("A pre-generated unique ID for the new block."),
});

const addTextBlockPrompt = ai.definePrompt({
  name: 'addTextBlockToPagePrompt',
  input: { schema: InternalFlowInputSchema },
  output: { schema: AddTextBlockToPageOutputSchema },
  prompt: `You are an AI assistant that modifies webpage structures represented as JSON.
You will be given the current page structure, the text for a new paragraph, and a unique ID for this new block.

Current Page Structure:
\`\`\`json
{{{JSONstringify currentPageStructure}}}
\`\`\`

New Paragraph Text: "{{paragraphText}}"
Unique ID for New Block: "{{newBlockId}}"

Your task is to:
1. Create a new visual block object for this paragraph. It MUST have:
   - id: "{{newBlockId}}" (use the provided unique ID)
   - type: "text"
   - props: { "text": "{{paragraphText}}", "level": "p" }
   - (No children for this text block)
2. Append this new block object to the END of the "blocks" array within the \`currentPageStructure\`.
3. Return the entire, modified \`updatedPageStructure\` as a single JSON object matching the output schema. Do not add any extra explanations or markdown formatting around the JSON.
   The output schema expects an object like: { "updatedPageStructure": { ... full page structure ... } }.
`,
});

const addTextBlockToPageInternalFlow = ai.defineFlow(
  {
    name: 'addTextBlockToPageInternalFlow',
    inputSchema: InternalFlowInputSchema, // Uses the internal schema
    outputSchema: AddTextBlockToPageOutputSchema,
  },
  async (input) => {
    // Helper for the prompt; Genkit doesn't have JSON.stringify by default in Handlebars
    // We can pass it as part of the input object if needed, or rely on direct object injection.
    // For simplicity, let's assume the model can handle the object if the prompt refers to it correctly.
    // The model will be guided by the input and output Zod schemas.
    
    const response = await addTextBlockPrompt(input);
    
    if (!response.output) {
      throw new Error("AI failed to generate the updated page structure.");
    }
    return response.output;
  }
);

// Register a Handlebars helper for JSON.stringify
// This is a common pattern if you need complex data in the prompt string itself.
// However, Genkit's structured input/output often makes this less necessary if the object is passed directly.
// For the current prompt, it's good practice to ensure the model sees the JSON structure explicitly.
if (typeof Handlebars !== 'undefined') {
    Handlebars.registerHelper('JSONstringify', function(context) {
        return JSON.stringify(context);
    });
} else {
    // In server environments, Handlebars might not be globally available in the same way.
    // Genkit's prompt execution environment should handle context injection.
    // The prompt is designed to work with Genkit's default object-to-template variable mapping.
}
