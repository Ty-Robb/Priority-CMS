import { ComponentAnalysis, ComponentProp } from './component-parser';
import { TemplateCreate, TemplateField, TemplateSection } from '../types/template';

/**
 * Map React prop types to template field types
 */
function mapPropTypeToFieldType(propType: string): string {
  // Remove any generics or unions for simplicity
  const baseType = propType.split('<')[0].split('|')[0].trim();
  
  // Map common React/TypeScript types to template field types
  const typeMap: Record<string, string> = {
    'string': 'Text',
    'number': 'Number',
    'boolean': 'Boolean',
    'Date': 'Date',
    'ReactNode': 'RichText',
    'ReactElement': 'RichText',
    'JSX.Element': 'RichText',
    'React.ReactNode': 'RichText',
    'React.ReactElement': 'RichText',
    'React.JSX.Element': 'RichText',
    'string[]': 'MultiSelect',
    'Array<string>': 'MultiSelect',
    'Record<string, any>': 'JSON',
    'object': 'JSON',
    'any': 'Text'
  };
  
  // Check for image-related types
  if (
    baseType.toLowerCase().includes('image') || 
    baseType.toLowerCase().includes('img') ||
    baseType.toLowerCase().includes('picture')
  ) {
    return 'Image';
  }
  
  // Check for URL-related types
  if (
    baseType.toLowerCase().includes('url') || 
    baseType.toLowerCase().includes('link') ||
    baseType.toLowerCase().includes('href')
  ) {
    return 'URL';
  }
  
  return typeMap[baseType] || 'Text';
}

/**
 * Format a prop name for display
 */
function formatPropName(name: string): string {
  // Convert camelCase to Title Case
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Generate a template definition from component analysis
 */
export function generateTemplate(component: ComponentAnalysis): TemplateCreate {
  // Convert component props to template fields
  const fields: TemplateField[] = component.props.map((prop, index) => ({
    id: prop.name,
    name: formatPropName(prop.name),
    description: prop.description || `${formatPropName(prop.name)} for the ${component.name} component`,
    type: mapPropTypeToFieldType(prop.type),
    validation: {
      required: prop.required
    },
    is_searchable: prop.name === 'title' || prop.name === 'heading' || prop.name === 'text',
    order: index
  }));
  
  // If component accepts children, add a content field
  if (component.hasChildren) {
    fields.push({
      id: 'content',
      name: 'Content',
      description: `Content for the ${component.name} component`,
      type: 'RichText',
      validation: {
        required: false
      },
      is_searchable: true,
      order: fields.length
    });
  }
  
  // Create sections based on field grouping
  const mainSection: TemplateSection = {
    id: 'main',
    name: 'Main',
    description: `Main section for ${component.name}`,
    fields,
    is_repeatable: false,
    order: 0
  };
  
  // Generate template
  return {
    name: `${component.name} Template`,
    description: component.description || `Template for the ${component.name} component`,
    type: 'Component',
    sections: [mainSection],
    status: 'Published',
    is_default: false,
    tags: ['component', 'shadcn', component.name.toLowerCase()]
  };
}

/**
 * Generate a template ID from component name
 */
export function generateTemplateId(componentName: string): string {
  return `shadcn-${componentName.toLowerCase()}-template`;
}
