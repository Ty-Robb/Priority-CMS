import { importComponent } from './import-components';
import { analyzeComponent } from './component-parser';
import { generateTemplate, generateTemplateId } from './template-generator';
import { TemplateApiClient } from '../lib/template-api-client';
import { ComponentRegistry } from '../lib/component-registry';
import { TemplateResponse } from '../types/template';

/**
 * Import and register a component from a URL
 * @param url URL of the component to import
 * @param apiBaseUrl Base URL for the API
 * @param apiToken Authentication token
 * @returns Template response if successful
 */
export async function importAndRegister(
  url: string, 
  apiBaseUrl: string, 
  apiToken: string
): Promise<TemplateResponse | null> {
  console.log(`Importing and registering component from ${url}...`);
  
  try {
    // 1. Import the component
    const importResult = await importComponent(url);
    if (!importResult.success) {
      console.error(`Failed to import component from ${url}: ${importResult.error}`);
      return null;
    }
    
    console.log(`Successfully imported component: ${importResult.componentName}`);
    
    // 2. Analyze the component
    if (!importResult.path) {
      console.error('Component path is missing');
      return null;
    }
    
    const analysis = analyzeComponent(importResult.path);
    console.log(`Analyzed component: ${analysis.name}`);
    console.log(`Found ${analysis.props.length} props`);
    console.log(`Has children: ${analysis.hasChildren}`);
    
    // 3. Generate a template
    const template = generateTemplate(analysis);
    console.log(`Generated template: ${template.name}`);
    
    // 4. Register the template with the API
    const apiClient = new TemplateApiClient(apiBaseUrl, apiToken);
    const templateResponse = await apiClient.createTemplate(template);
    console.log(`Registered template with ID: ${templateResponse.id}`);
    
    // 5. Update the component registry
    const registry = ComponentRegistry.getInstance();
    registry.registerComponent(
      importResult.componentName,
      importResult.path,
      templateResponse.id,
      template.tags || []
    );
    console.log(`Updated component registry`);
    
    return templateResponse;
  } catch (error: any) {
    console.error('Error importing and registering component:', error.message || error);
    return null;
  }
}

/**
 * Import and register multiple components
 * @param urls URLs of components to import
 * @param apiBaseUrl Base URL for the API
 * @param apiToken Authentication token
 * @returns Array of template responses
 */
export async function importAndRegisterBulk(
  urls: string[],
  apiBaseUrl: string,
  apiToken: string
): Promise<(TemplateResponse | null)[]> {
  const results: (TemplateResponse | null)[] = [];
  
  for (const url of urls) {
    const result = await importAndRegister(url, apiBaseUrl, apiToken);
    results.push(result);
  }
  
  return results;
}

/**
 * Check if a component is already registered
 * @param url URL of the component
 * @returns True if the component is already registered
 */
export function isComponentRegistered(url: string): boolean {
  // Extract component name from URL
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  
  if (!lastPart) {
    return false;
  }
  
  // Convert hero1 to Hero
  const baseName = lastPart.replace(/[^a-zA-Z]/g, '');
  const componentName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  
  // Check if component is registered
  const registry = ComponentRegistry.getInstance();
  return registry.hasComponent(componentName);
}
