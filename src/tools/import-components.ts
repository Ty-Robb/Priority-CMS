import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Result of a component import operation
 */
export interface ImportResult {
  componentName: string;
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Extract component name from shadcn CLI output
 */
function extractComponentName(output: string): string {
  // Example output: "✓ Added Hero component to src/components/blocks/hero1.tsx"
  const match = output.match(/Added (\w+) component to (.*)/i);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: extract from path
  const pathMatch = output.match(/to\s+(.*)/i);
  if (pathMatch && pathMatch[1]) {
    const filePath = pathMatch[1].trim();
    const fileName = path.basename(filePath, path.extname(filePath));
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
  }
  
  return 'UnknownComponent';
}

/**
 * Extract component path from shadcn CLI output
 */
function extractComponentPath(output: string): string {
  const match = output.match(/to\s+(.*)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return '';
}

/**
 * Extract component name from URL
 */
function extractComponentNameFromUrl(url: string): string {
  // Example URL: https://www.shadcnblocks.com/r/hero1
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  
  // Convert hero1 to Hero
  if (lastPart) {
    // Remove numbers and special characters
    const baseName = lastPart.replace(/[^a-zA-Z]/g, '');
    // Capitalize first letter
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }
  
  return 'UnknownComponent';
}

/**
 * Import a component using the shadcn CLI
 */
export async function importComponent(url: string): Promise<ImportResult> {
  try {
    // Execute the shadcn CLI command
    const output = execSync(`npx shadcn@canary add ${url}`, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Extract component information from output
    const componentName = extractComponentName(output);
    const componentPath = extractComponentPath(output);
    
    console.log(`Successfully imported ${componentName} from ${url}`);
    console.log(`Component path: ${componentPath}`);
    
    return {
      componentName,
      success: true,
      path: componentPath
    };
  } catch (error: any) {
    console.error(`Failed to import component from ${url}:`, error.message);
    
    return {
      componentName: extractComponentNameFromUrl(url),
      success: false,
      error: error.message || String(error)
    };
  }
}

/**
 * Import multiple components
 */
export async function importComponents(urls: string[]): Promise<ImportResult[]> {
  const results: ImportResult[] = [];
  
  for (const url of urls) {
    const result = await importComponent(url);
    results.push(result);
  }
  
  return results;
}
