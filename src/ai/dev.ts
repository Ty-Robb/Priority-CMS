
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-headline-options.ts';
import '@/ai/flows/suggest-relevant-keywords.ts';
import '@/ai/flows/generate-page-content.ts';
import '@/ai/flows/add-text-block-to-page-flow.ts'; // Keep this import
// Types file (add-text-block-to-page-types.ts) does not need to be imported here as it's used by the flow itself.

