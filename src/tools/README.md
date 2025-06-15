# shadcn Component Import System

This tool allows you to import components from shadcnblocks.com and automatically register them as templates in the Priority CMS.

## Installation

The required dependencies are:

```bash
npm install --save yargs dotenv typescript @types/node
```

## Configuration

Create a `.env` file in the root of your project with the following variables:

```
API_BASE_URL=http://localhost:8001
API_TOKEN=your_api_token_here
```

## Usage

### Import a Single Component

To import a single component from shadcnblocks.com:

```bash
npx ts-node src/tools/cli.ts import https://www.shadcnblocks.com/r/hero1
```

This will:
1. Import the component using the shadcn CLI
2. Analyze the component structure
3. Generate a template definition
4. Register the template with the API
5. Update the component registry

### Import Multiple Components

To import multiple components at once, create a JSON file with an array of URLs:

```json
[
  "https://www.shadcnblocks.com/r/hero1",
  "https://www.shadcnblocks.com/r/features1",
  "https://www.shadcnblocks.com/r/testimonials1"
]
```

Then run:

```bash
npx ts-node src/tools/cli.ts import-bulk src/data/sample-components.json
```

### List Registered Components

To list all registered components:

```bash
npx ts-node src/tools/cli.ts list
```

### Force Reimport

To force reimport of a component that's already registered:

```bash
npx ts-node src/tools/cli.ts import https://www.shadcnblocks.com/r/hero1 --force
```

## How It Works

The import process consists of several steps:

1. **Component Import**: The tool uses the shadcn CLI to import the component from shadcnblocks.com.

2. **Component Analysis**: The imported component is analyzed to extract its structure, props, and other metadata.

3. **Template Generation**: A template definition is generated based on the component analysis.

4. **Template Registration**: The template is registered with the Priority CMS API.

5. **Component Registry**: The component is added to the component registry for future reference.

## Component Registry

The component registry keeps track of all imported components and their associated templates. It's stored in `src/data/component-registry.json`.

## Programmatic Usage

You can also use the import system programmatically in your code:

```typescript
import { importAndRegister } from './tools/import-and-register';

async function importComponent() {
  const result = await importAndRegister(
    'https://www.shadcnblocks.com/r/hero1',
    'http://localhost:8001',
    'your_api_token_here'
  );
  
  if (result) {
    console.log(`Imported component with template ID: ${result.id}`);
  }
}
```

## Troubleshooting

### Component Import Fails

If the component import fails, check:
- You have the shadcn CLI installed
- The URL is correct
- You have the necessary dependencies installed

### Template Registration Fails

If the template registration fails, check:
- The API server is running
- The API_BASE_URL is correct
- The API_TOKEN is valid
- The template definition is valid

## Available Components

Here are some of the components available on shadcnblocks.com:

- Hero Sections: hero1, hero2, hero3
- Feature Sections: features1, features2, features3
- Testimonial Sections: testimonials1, testimonials2
- Pricing Sections: pricing1, pricing2
- CTA Sections: cta1, cta2
- Footer Sections: footer1, footer2
