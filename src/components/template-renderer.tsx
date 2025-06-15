"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ComponentRegistry } from '../lib/component-registry';

/**
 * Props for the TemplateRenderer component
 */
interface TemplateRendererProps {
  templateId: string;
  data: Record<string, any>;
  className?: string;
}

/**
 * TemplateRenderer component
 * Renders a template using the associated shadcn component
 */
export function TemplateRenderer({ templateId, data, className = '' }: TemplateRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true);
        
        // Get component from registry
        const registry = ComponentRegistry.getInstance();
        const registeredComponent = registry.getComponentByTemplateId(templateId);
        
        if (!registeredComponent) {
          throw new Error(`No component found for template ${templateId}`);
        }
        
        // Dynamically import the component
        const DynamicComponent = dynamic(() => import(registeredComponent.path), {
          loading: () => <div className="p-4 border border-gray-200 rounded-md animate-pulse">Loading component...</div>,
          ssr: false
        });
        
        setComponent(() => DynamicComponent);
        setError(null);
      } catch (err: any) {
        console.error('Error loading component:', err);
        setError(err.message || 'Failed to load component');
      } finally {
        setLoading(false);
      }
    }
    
    if (templateId) {
      loadComponent();
    }
  }, [templateId]);
  
  if (loading) {
    return (
      <div className={`p-4 border border-gray-200 rounded-md animate-pulse ${className}`}>
        Loading component...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded-md text-red-500 ${className}`}>
        Error: {error}
      </div>
    );
  }
  
  if (!Component) {
    return (
      <div className={`p-4 border border-yellow-200 bg-yellow-50 rounded-md text-yellow-700 ${className}`}>
        Component not found
      </div>
    );
  }
  
  // Render the component with the provided data
  return <Component {...data} className={className} />;
}

/**
 * Props for the TemplateList component
 */
interface TemplateListProps {
  templates: Array<{
    id: string;
    name: string;
    data: Record<string, any>;
  }>;
  className?: string;
}

/**
 * TemplateList component
 * Renders a list of templates
 */
export function TemplateList({ templates, className = '' }: TemplateListProps) {
  return (
    <div className={className}>
      {templates.map((template) => (
        <div key={template.id} className="mb-8">
          <h3 className="text-lg font-medium mb-2">{template.name}</h3>
          <TemplateRenderer
            templateId={template.id}
            data={template.data}
          />
        </div>
      ))}
    </div>
  );
}
