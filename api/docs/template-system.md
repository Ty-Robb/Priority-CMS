# Template System Documentation

The Priority CMS Template System provides a flexible way to define content structures for various types of content. Templates define the structure, fields, and validation rules for content items, allowing for consistent content creation and management.

## Overview

Templates in Priority CMS are structured documents that define:

1. **Metadata** - Name, description, type, status, etc.
2. **Sections** - Logical groupings of fields
3. **Fields** - Individual data points with types and validation rules
4. **Versioning** - Track changes to templates over time

Templates can be used for various content types, including pages, sections, components, emails, and social media posts.

## Template Types

- **Page** - Templates for full pages (e.g., blog post, landing page)
- **Section** - Templates for page sections (e.g., hero, feature list)
- **Component** - Templates for reusable components (e.g., call-to-action, testimonial)
- **Email** - Templates for email content
- **Social** - Templates for social media posts

## Template Structure

A template consists of the following properties:

- **id** - Unique identifier
- **name** - Template name
- **description** - Template description
- **type** - Template type (Page, Section, Component, Email, Social)
- **sections** - Array of sections
- **status** - Template status (Draft, Published, Archived)
- **is_default** - Whether this is a default template
- **thumbnail_url** - URL to template thumbnail image
- **tags** - Array of tags for categorization
- **metadata** - Additional metadata
- **version** - Template version number
- **created_at** - Creation timestamp
- **updated_at** - Last update timestamp
- **created_by** - User ID of creator
- **updated_by** - User ID of last updater

### Sections

Sections are logical groupings of fields. Each section has:

- **id** - Unique identifier
- **name** - Section name
- **description** - Section description
- **fields** - Array of fields
- **is_repeatable** - Whether the section can be repeated
- **min_items** - Minimum number of items (for repeatable sections)
- **max_items** - Maximum number of items (for repeatable sections)
- **order** - Display order

### Fields

Fields define individual data points. Each field has:

- **id** - Unique identifier
- **name** - Field name
- **description** - Field description
- **type** - Field type (Text, RichText, Number, Boolean, Date, Image, etc.)
- **validation** - Validation rules
- **is_searchable** - Whether the field is searchable
- **is_localized** - Whether the field can be localized
- **is_hidden** - Whether the field is hidden in the UI
- **group** - Field group for organization
- **order** - Display order

#### Field Types

- **Text** - Single-line text
- **RichText** - Multi-line formatted text
- **Number** - Numeric value
- **Boolean** - True/false value
- **Date** - Date value
- **Image** - Image file
- **File** - Any file type
- **Reference** - Reference to another content item
- **Select** - Single selection from options
- **MultiSelect** - Multiple selections from options
- **Color** - Color value
- **URL** - URL value
- **Email** - Email address
- **Phone** - Phone number
- **Location** - Geographic location
- **JSON** - JSON data
- **Markdown** - Markdown text
- **Code** - Code snippet

#### Validation Rules

- **required** - Whether the field is required
- **min_length** - Minimum text length
- **max_length** - Maximum text length
- **min_value** - Minimum numeric value
- **max_value** - Maximum numeric value
- **pattern** - Regex pattern for validation
- **options** - Available options for Select/MultiSelect
- **default_value** - Default value

## API Endpoints

### Templates

- `GET /api/templates` - Get all templates with pagination
- `GET /api/templates/{template_id}` - Get a specific template
- `GET /api/templates/type/{template_type}` - Get templates by type
- `GET /api/templates/status/{status}` - Get templates by status
- `POST /api/templates` - Create a new template
- `PUT /api/templates/{template_id}` - Update a template
- `DELETE /api/templates/{template_id}` - Delete a template
- `GET /api/templates/{template_id}/versions` - Get all versions of a template

## Usage Examples

### Creating a Template

```json
{
  "name": "Blog Post Template",
  "description": "Template for blog posts",
  "type": "Page",
  "sections": [
    {
      "id": "header",
      "name": "Header",
      "description": "Blog post header",
      "fields": [
        {
          "id": "title",
          "name": "Title",
          "description": "Blog post title",
          "type": "Text",
          "validation": {
            "required": true,
            "max_length": 100
          },
          "is_searchable": true,
          "order": 0
        },
        {
          "id": "featured_image",
          "name": "Featured Image",
          "description": "Featured image for the blog post",
          "type": "Image",
          "validation": {
            "required": true
          },
          "order": 1
        }
      ],
      "is_repeatable": false,
      "order": 0
    },
    {
      "id": "content",
      "name": "Content",
      "description": "Blog post content",
      "fields": [
        {
          "id": "body",
          "name": "Body",
          "description": "Blog post body",
          "type": "RichText",
          "validation": {
            "required": true
          },
          "is_searchable": true,
          "order": 0
        }
      ],
      "is_repeatable": false,
      "order": 1
    },
    {
      "id": "tags",
      "name": "Tags",
      "description": "Blog post tags",
      "fields": [
        {
          "id": "tag",
          "name": "Tag",
          "description": "Blog post tag",
          "type": "Text",
          "order": 0
        }
      ],
      "is_repeatable": true,
      "min_items": 1,
      "max_items": 10,
      "order": 2
    }
  ],
  "status": "Published",
  "is_default": true,
  "tags": ["blog", "post"]
}
```

### Using Templates with Content

Templates are used to define the structure of content items. When creating a content item, you select a template and then fill in the fields defined by the template.

```json
{
  "template_id": "blog-post-template-id",
  "title": "My Blog Post",
  "content": {
    "header": {
      "title": "My First Blog Post",
      "featured_image": "https://example.com/images/featured.jpg"
    },
    "content": {
      "body": "<p>This is my first blog post.</p>"
    },
    "tags": [
      { "tag": "blog" },
      { "tag": "first-post" }
    ]
  },
  "status": "Draft"
}
```

## Best Practices

1. **Use descriptive names** - Use clear, descriptive names for templates, sections, and fields
2. **Group related fields** - Use sections to group related fields
3. **Set appropriate validation** - Use validation rules to ensure data quality
4. **Use versioning** - Keep track of template changes with versioning
5. **Use tags** - Tag templates for better organization
6. **Document templates** - Add descriptions to templates, sections, and fields
7. **Test templates** - Test templates with sample content before using them in production

## Development Mode

In development mode, the template system uses in-memory storage with sample templates. This allows for testing and development without a database connection.

## Error Handling

The template system includes error handling for common issues:

- **Not Found** - Template not found
- **Validation Error** - Invalid template data
- **Permission Error** - User doesn't have permission to perform the action
- **Server Error** - Internal server error

## Future Enhancements

Planned enhancements for the template system include:

1. **Template inheritance** - Allow templates to inherit from other templates
2. **Conditional fields** - Show/hide fields based on conditions
3. **Field dependencies** - Define dependencies between fields
4. **Template export/import** - Export and import templates
5. **Template preview** - Preview templates with sample data
6. **Template analytics** - Track template usage and performance
