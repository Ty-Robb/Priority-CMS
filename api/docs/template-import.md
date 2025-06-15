# Template Import System

This document outlines a system for automatically generating templates by analyzing existing content.

## Overview

The Template Import System allows users to import existing content (HTML pages, JSON data, etc.) and automatically generate templates based on the structure of that content. This is particularly useful for:

1. Migrating from another CMS
2. Creating templates from existing websites
3. Quickly bootstrapping a new project with existing content

## How It Works

The system works by:

1. Analyzing the structure of imported content
2. Identifying common patterns and fields
3. Generating template definitions based on these patterns
4. Creating templates in the system

## Import Sources

The system supports importing from various sources:

### HTML Pages

When importing HTML pages, the system:

1. Parses the HTML structure
2. Identifies semantic sections (header, main content, footer, etc.)
3. Extracts content fields (headings, paragraphs, images, etc.)
4. Analyzes common patterns across multiple pages
5. Generates template definitions

### JSON/XML Data

When importing structured data:

1. Analyzes the data schema
2. Maps fields to template field types
3. Identifies nested structures as sections
4. Generates template definitions

### Other CMS Exports

The system can import from common CMS export formats:

1. WordPress XML exports
2. Contentful exports
3. Strapi exports
4. Custom CSV/JSON exports

## Implementation

### 1. Content Analyzer

The Content Analyzer is responsible for:

```python
class ContentAnalyzer:
    def analyze_html(self, html_content):
        """Analyze HTML content and extract structure"""
        # Parse HTML
        # Identify sections
        # Extract fields
        # Return structured data
        
    def analyze_json(self, json_content):
        """Analyze JSON content and extract structure"""
        # Parse JSON
        # Map to field types
        # Identify sections
        # Return structured data
        
    def analyze_xml(self, xml_content):
        """Analyze XML content and extract structure"""
        # Parse XML
        # Map to field types
        # Identify sections
        # Return structured data
```

### 2. Pattern Detector

The Pattern Detector identifies common patterns across multiple content items:

```python
class PatternDetector:
    def detect_patterns(self, analyzed_contents):
        """Detect common patterns across multiple content items"""
        # Compare structures
        # Identify common fields
        # Detect repeating sections
        # Return pattern information
```

### 3. Template Generator

The Template Generator creates template definitions based on the detected patterns:

```python
class TemplateGenerator:
    def generate_template(self, patterns):
        """Generate template definition from patterns"""
        # Create template structure
        # Define sections
        # Define fields
        # Set validation rules
        # Return template definition
```

### 4. Import Service

The Import Service orchestrates the import process:

```python
class ImportService:
    def __init__(self):
        self.analyzer = ContentAnalyzer()
        self.detector = PatternDetector()
        self.generator = TemplateGenerator()
        self.template_service = TemplateService()
        
    async def import_from_html(self, html_files, user_id):
        """Import templates from HTML files"""
        # Analyze HTML files
        analyzed_contents = [self.analyzer.analyze_html(html) for html in html_files]
        
        # Detect patterns
        patterns = self.detector.detect_patterns(analyzed_contents)
        
        # Generate template
        template_def = self.generator.generate_template(patterns)
        
        # Create template
        return await self.template_service.create(template_def, user_id)
        
    async def import_from_json(self, json_files, user_id):
        """Import templates from JSON files"""
        # Similar to import_from_html
        
    async def import_from_xml(self, xml_files, user_id):
        """Import templates from XML files"""
        # Similar to import_from_html
```

## API Endpoints

The system exposes the following API endpoints:

```python
@router.post("/import/html", response_model=TemplateResponse)
async def import_from_html(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Import templates from HTML files"""
    import_service = ImportService()
    html_contents = [await file.read() for file in files]
    return await import_service.import_from_html(html_contents, current_user.id)

@router.post("/import/json", response_model=TemplateResponse)
async def import_from_json(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Import templates from JSON files"""
    import_service = ImportService()
    json_contents = [await file.read() for file in files]
    return await import_service.import_from_json(json_contents, current_user.id)

@router.post("/import/xml", response_model=TemplateResponse)
async def import_from_xml(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user)
):
    """Import templates from XML files"""
    import_service = ImportService()
    xml_contents = [await file.read() for file in files]
    return await import_service.import_from_xml(xml_contents, current_user.id)

@router.post("/import/url", response_model=TemplateResponse)
async def import_from_url(
    urls: List[str],
    current_user: User = Depends(get_current_user)
):
    """Import templates from URLs"""
    import_service = ImportService()
    # Fetch HTML content from URLs
    html_contents = []
    async with aiohttp.ClientSession() as session:
        for url in urls:
            async with session.get(url) as response:
                html_contents.append(await response.text())
    
    return await import_service.import_from_html(html_contents, current_user.id)
```

## Frontend Implementation

The frontend implementation includes:

1. Import wizard with multiple steps
2. Source selection (HTML, JSON, XML, URL)
3. File upload or URL input
4. Preview of detected structure
5. Template customization options
6. Template creation confirmation

## Example: HTML Import

When importing HTML pages, the system:

1. Analyzes the HTML structure:
   ```html
   <article>
     <header>
       <h1>Article Title</h1>
       <img src="featured.jpg" alt="Featured Image">
     </header>
     <div class="content">
       <p>Article content...</p>
     </div>
     <footer>
       <div class="author">
         <img src="author.jpg" alt="Author">
         <span>Author Name</span>
       </div>
       <div class="tags">
         <span>Tag 1</span>
         <span>Tag 2</span>
       </div>
     </footer>
   </article>
   ```

2. Identifies sections and fields:
   ```json
   {
     "sections": [
       {
         "id": "header",
         "name": "Header",
         "fields": [
           {
             "id": "title",
             "name": "Title",
             "type": "Text",
             "selector": "h1"
           },
           {
             "id": "featured_image",
             "name": "Featured Image",
             "type": "Image",
             "selector": "img"
           }
         ]
       },
       {
         "id": "content",
         "name": "Content",
         "fields": [
           {
             "id": "body",
             "name": "Body",
             "type": "RichText",
             "selector": ".content"
           }
         ]
       },
       {
         "id": "footer",
         "name": "Footer",
         "fields": [
           {
             "id": "author",
             "name": "Author",
             "type": "Object",
             "fields": [
               {
                 "id": "avatar",
                 "name": "Avatar",
                 "type": "Image",
                 "selector": ".author img"
               },
               {
                 "id": "name",
                 "name": "Name",
                 "type": "Text",
                 "selector": ".author span"
               }
             ]
           },
           {
             "id": "tags",
             "name": "Tags",
             "type": "Array",
             "items": {
               "type": "Text",
               "selector": ".tags span"
             }
           }
         ]
       }
     ]
   }
   ```

3. Generates a template definition:
   ```json
   {
     "name": "Article Template",
     "description": "Template for articles",
     "type": "Page",
     "sections": [
       {
         "id": "header",
         "name": "Header",
         "description": "Article header",
         "fields": [
           {
             "id": "title",
             "name": "Title",
             "description": "Article title",
             "type": "Text",
             "validation": {
               "required": true
             },
             "is_searchable": true,
             "order": 0
           },
           {
             "id": "featured_image",
             "name": "Featured Image",
             "description": "Featured image for the article",
             "type": "Image",
             "order": 1
           }
         ],
         "is_repeatable": false,
         "order": 0
       },
       {
         "id": "content",
         "name": "Content",
         "description": "Article content",
         "fields": [
           {
             "id": "body",
             "name": "Body",
             "description": "Article body",
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
         "id": "footer",
         "name": "Footer",
         "description": "Article footer",
         "fields": [
           {
             "id": "author_avatar",
             "name": "Author Avatar",
             "description": "Author avatar",
             "type": "Image",
             "order": 0
           },
           {
             "id": "author_name",
             "name": "Author Name",
             "description": "Author name",
             "type": "Text",
             "order": 1
           }
         ],
         "is_repeatable": false,
         "order": 2
       },
       {
         "id": "tags",
         "name": "Tags",
         "description": "Article tags",
         "fields": [
           {
             "id": "tag",
             "name": "Tag",
             "description": "Article tag",
             "type": "Text",
             "order": 0
           }
         ],
         "is_repeatable": true,
         "min_items": 0,
         "max_items": 10,
         "order": 3
       }
     ],
     "status": "Draft"
   }
   ```

## Benefits

The Template Import System provides several benefits:

1. **Time Saving**: Automatically generate templates instead of creating them manually
2. **Consistency**: Ensure templates match existing content structure
3. **Migration**: Easily migrate from other systems
4. **Discovery**: Identify common patterns in existing content
5. **Bootstrapping**: Quickly set up a new project with existing content

## Limitations

The system has some limitations:

1. **Complex Structures**: May struggle with very complex or inconsistent content structures
2. **Custom Fields**: May not correctly identify custom field types
3. **JavaScript Content**: Cannot analyze content rendered by JavaScript
4. **Validation Rules**: Cannot infer validation rules from content

## Future Enhancements

Future enhancements to the system could include:

1. **Machine Learning**: Use ML to improve pattern detection
2. **Content Migration**: Not just create templates, but also migrate content
3. **Custom Field Type Detection**: Better detection of custom field types
4. **Validation Rule Inference**: Infer validation rules from content
5. **Interactive Editor**: Interactive editor for refining detected templates
