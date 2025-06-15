/**
 * Template status enum
 */
export enum TemplateStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived'
}

/**
 * Template type enum
 */
export enum TemplateType {
  PAGE = 'Page',
  SECTION = 'Section',
  COMPONENT = 'Component',
  EMAIL = 'Email',
  SOCIAL = 'Social'
}

/**
 * Field type enum
 */
export enum FieldType {
  TEXT = 'Text',
  RICH_TEXT = 'RichText',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date',
  IMAGE = 'Image',
  FILE = 'File',
  REFERENCE = 'Reference',
  SELECT = 'Select',
  MULTI_SELECT = 'MultiSelect',
  COLOR = 'Color',
  URL = 'URL',
  EMAIL = 'Email',
  PHONE = 'Phone',
  LOCATION = 'Location',
  JSON = 'JSON',
  MARKDOWN = 'Markdown',
  CODE = 'Code'
}

/**
 * Field validation interface
 */
export interface FieldValidation {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  options?: string[];
  default_value?: any;
}

/**
 * Template field interface
 */
export interface TemplateField {
  id: string;
  name: string;
  description?: string;
  type: string;
  validation?: FieldValidation;
  is_searchable?: boolean;
  is_localized?: boolean;
  is_hidden?: boolean;
  group?: string;
  order: number;
}

/**
 * Template section interface
 */
export interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  is_repeatable: boolean;
  min_items?: number;
  max_items?: number;
  order: number;
}

/**
 * Template create interface
 */
export interface TemplateCreate {
  name: string;
  description?: string;
  type: string;
  sections: TemplateSection[];
  status: string;
  is_default: boolean;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Template update interface
 */
export interface TemplateUpdate {
  name?: string;
  description?: string;
  type?: string;
  sections?: TemplateSection[];
  status?: string;
  is_default?: boolean;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Template version interface
 */
export interface TemplateVersion {
  version: number;
  created_at: string;
  created_by: string;
  changes?: string;
  template_data: Record<string, any>;
}

/**
 * Template response interface
 */
export interface TemplateResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  sections: TemplateSection[];
  status: string;
  is_default: boolean;
  thumbnail_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
