import { TemplateCreate, TemplateResponse, TemplateUpdate } from '../types/template';

/**
 * Template API Client for interacting with the template API
 */
export class TemplateApiClient {
  private baseUrl: string;
  private token: string;
  
  /**
   * Create a new TemplateApiClient
   * @param baseUrl Base URL for the API
   * @param token Authentication token
   */
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }
  
  /**
   * Create a new template
   * @param template Template to create
   * @returns Created template
   */
  async createTemplate(template: TemplateCreate): Promise<TemplateResponse> {
    const response = await fetch(`${this.baseUrl}/api/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(template)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get a template by ID
   * @param id Template ID
   * @returns Template
   */
  async getTemplate(id: string): Promise<TemplateResponse> {
    const response = await fetch(`${this.baseUrl}/api/templates/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get template: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Update a template
   * @param id Template ID
   * @param template Template updates
   * @returns Updated template
   */
  async updateTemplate(id: string, template: TemplateUpdate): Promise<TemplateResponse> {
    const response = await fetch(`${this.baseUrl}/api/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(template)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Delete a template
   * @param id Template ID
   * @returns Success status
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/templates/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.statusText}`);
    }
    
    return true;
  }
  
  /**
   * Get all templates
   * @param page Page number
   * @param limit Items per page
   * @param type Filter by template type
   * @param status Filter by template status
   * @returns Templates
   */
  async getTemplates(
    page: number = 1, 
    limit: number = 10,
    type?: string,
    status?: string
  ): Promise<{ templates: TemplateResponse[], total: number }> {
    let url = `${this.baseUrl}/api/templates?page=${page}&limit=${limit}`;
    
    if (type) {
      url += `&type=${type}`;
    }
    
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get templates: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get templates by tag
   * @param tag Tag to filter by
   * @param page Page number
   * @param limit Items per page
   * @returns Templates
   */
  async getTemplatesByTag(
    tag: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ templates: TemplateResponse[], total: number }> {
    const url = `${this.baseUrl}/api/templates/tag/${tag}?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get templates by tag: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
