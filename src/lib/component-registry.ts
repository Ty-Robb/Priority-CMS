import fs from 'fs';
import path from 'path';

/**
 * Interface for a registered component
 */
export interface RegisteredComponent {
  name: string;
  path: string;
  importedAt: string;
  templateId?: string;
  tags: string[];
}

/**
 * Component Registry for tracking imported shadcn components
 */
export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, RegisteredComponent> = new Map();
  private registryPath: string;
  
  private constructor() {
    this.registryPath = path.join(process.cwd(), 'src/data/component-registry.json');
    this.loadRegistry();
  }
  
  /**
   * Get the singleton instance of the ComponentRegistry
   */
  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }
  
  /**
   * Register a new component
   */
  public registerComponent(
    name: string, 
    componentPath: string, 
    templateId?: string,
    tags: string[] = []
  ): void {
    this.components.set(name, {
      name,
      path: componentPath,
      importedAt: new Date().toISOString(),
      templateId,
      tags: [...tags, 'shadcn']
    });
    this.saveRegistry();
  }
  
  /**
   * Get a component by name
   */
  public getComponent(name: string): RegisteredComponent | undefined {
    return this.components.get(name);
  }
  
  /**
   * Get a component by template ID
   */
  public getComponentByTemplateId(templateId: string): RegisteredComponent | undefined {
    for (const component of this.components.values()) {
      if (component.templateId === templateId) {
        return component;
      }
    }
    return undefined;
  }
  
  /**
   * Get all registered components
   */
  public getAllComponents(): RegisteredComponent[] {
    return Array.from(this.components.values());
  }
  
  /**
   * Check if a component is registered
   */
  public hasComponent(name: string): boolean {
    return this.components.has(name);
  }
  
  /**
   * Remove a component from the registry
   */
  public removeComponent(name: string): boolean {
    const result = this.components.delete(name);
    if (result) {
      this.saveRegistry();
    }
    return result;
  }
  
  /**
   * Load the registry from disk
   */
  private loadRegistry(): void {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = fs.readFileSync(this.registryPath, 'utf-8');
        const registry = JSON.parse(data);
        
        this.components.clear();
        for (const component of registry) {
          this.components.set(component.name, component);
        }
      }
    } catch (error) {
      console.error('Failed to load component registry:', error);
    }
  }
  
  /**
   * Save the registry to disk
   */
  private saveRegistry(): void {
    try {
      const dirPath = path.dirname(this.registryPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const data = JSON.stringify(Array.from(this.components.values()), null, 2);
      fs.writeFileSync(this.registryPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save component registry:', error);
    }
  }
}
