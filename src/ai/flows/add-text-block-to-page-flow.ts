
'use server';
/**
 * @fileOverview A Genkit flow to add a new text block (paragraph) to an existing page structure.
 *
 * - addTextBlockToPage - A function that takes the current page structure and new paragraph text,
 *   and returns the updated page structure with the new paragraph appended.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
    AddTextBlockToPageInputSchema, 
    AddTextBlockToPageOutputSchema,
    type AddTextBlockToPageInput,
    type AddTextBlockToPageOutput
} from './add-text-block-to-page-types'; // Import from new types file

export async function addTextBlockToPage(input: AddTextBlockToPageInput): Promise<AddTextBlockToPageOutput> {
  const newBlockId = `block-text-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const result = await addTextBlockToPageInternalFlow({
    currentPageStructure: input.currentPageStructure,
    paragraphText: input.paragraphText,
    newBlockId: newBlockId,
  });
  return result;
}

// This schema is for the internal flow's direct input
const InternalFlowInputSchema = AddTextBlockToPageInputSchema.extend({
    newBlockId: z.string().describe("A pre-generated unique ID for the new block."),
});

// This schema is specifically for what the prompt template itself expects
const PromptTemplateInputSchema = z.object({
    currentPageStructureString: z.string().describe("The stringified JSON representation of the current page structure."),
    paragraphText: z.string().describe("The text content for the new paragraph."),
    newBlockId: z.string().describe("A pre-generated unique ID for the new block."),
});

const addTextBlockPrompt = ai.definePrompt({
  name: 'addTextBlockToPagePrompt',
  input: { schema: PromptTemplateInputSchema }, // Prompt uses the schema with stringified JSON
  output: { schema: AddTextBlockToPageOutputSchema }, // Output schema remains the same
  prompt: `You are an AI assistant that modifies webpage structures represented as JSON.
You will be given the current page structure as a JSON string, the text for a new paragraph, and a unique ID for this new block.

Current Page Structure (JSON String):
\`\`\`json
{{{currentPageStructureString}}}
\`\`\`

New Paragraph Text: "{{paragraphText}}"
Unique ID for New Block: "{{newBlockId}}"

Your task is to:
1. Parse the \`currentPageStructureString\` into a JSON object.
2. Create a new visual block object for this paragraph. It MUST have:
   - id: "{{newBlockId}}" (use the provided unique ID)
   - type: "text"
   - props: { "text": "{{paragraphText}}", "level": "p" }
   - (No children for this text block)
3. Append this new block object to the END of the "blocks" array within the parsed page structure.
4. Return the entire, modified page structure as a single JSON object matching the output schema. Do not add any extra explanations or markdown formatting around the JSON.
   The output schema expects an object like: { "updatedPageStructure": { ... full page structure ... } }. Ensure the output is a valid JSON object.
`,
});

const addTextBlockToPageInternalFlow = ai.defineFlow(
  {
    name: 'addTextBlockToPageInternalFlow',
    inputSchema: InternalFlowInputSchema, // Flow receives the object structure
    outputSchema: AddTextBlockToPageOutputSchema,
  },
  async (flowInput) => {
    const stringifiedStructure = JSON.stringify(flowInput.currentPageStructure);
    
    const promptPayload = {
      currentPageStructureString: stringifiedStructure,
      paragraphText: flowInput.paragraphText,
      newBlockId: flowInput.newBlockId,
    };
    
    const response = await addTextBlockPrompt(promptPayload);
    
    if (!response.output) {
      throw new Error("AI failed to generate the updated page structure.");
    }
    return response.output;
  }
);

// Ensure only async functions are effectively exported due to 'use server'
// Types and non-async schemas are now in add-text-block-to-page-types.ts
