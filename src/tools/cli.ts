#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { importAndRegister, importAndRegisterBulk, isComponentRegistered } from './import-and-register';
import { ComponentRegistry } from '../lib/component-registry';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001';
const API_TOKEN = process.env.API_TOKEN || '';

/**
 * Main CLI function
 */
async function main() {
  yargs(hideBin(process.argv))
    .command(
      'import <url>',
      'Import a component from shadcnblocks',
      (yargs) => {
        return yargs.positional('url', {
          describe: 'URL or identifier of the component',
          type: 'string',
          demandOption: true
        });
      },
      async (argv) => {
        const url = argv.url as string;
        
        // Check if component is already registered
        if (isComponentRegistered(url)) {
          console.log(`Component from ${url} is already registered.`);
          console.log('Use --force to reimport.');
          
          if (!argv.force) {
            return;
          }
        }
        
        // Import and register component
        const result = await importAndRegister(
          url,
          API_BASE_URL,
          API_TOKEN
        );
        
        if (result) {
          console.log('Component imported and registered successfully!');
          console.log(`Template ID: ${result.id}`);
          console.log(`Template Name: ${result.name}`);
        } else {
          console.error('Failed to import and register component.');
          process.exit(1);
        }
      }
    )
    .command(
      'import-bulk <file>',
      'Import multiple components from a JSON file',
      (yargs) => {
        return yargs.positional('file', {
          describe: 'Path to JSON file with component URLs',
          type: 'string',
          demandOption: true
        });
      },
      async (argv) => {
        const filePath = argv.file as string;
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
        
        // Read file
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let urls: string[];
        
        try {
          urls = JSON.parse(fileContent);
        } catch (error) {
          console.error('Invalid JSON file');
          process.exit(1);
        }
        
        if (!Array.isArray(urls)) {
          console.error('File must contain an array of URLs');
          process.exit(1);
        }
        
        // Import and register components
        console.log(`Importing ${urls.length} components...`);
        
        const results = await importAndRegisterBulk(
          urls,
          API_BASE_URL,
          API_TOKEN
        );
        
        // Print results
        const successful = results.filter(Boolean).length;
        console.log(`Successfully imported ${successful} of ${urls.length} components.`);
        
        if (successful < urls.length) {
          console.error(`Failed to import ${urls.length - successful} components.`);
          process.exit(1);
        }
      }
    )
    .command(
      'list',
      'List all registered components',
      () => {},
      () => {
        const registry = ComponentRegistry.getInstance();
        const components = registry.getAllComponents();
        
        if (components.length === 0) {
          console.log('No components registered.');
          return;
        }
        
        console.log(`Found ${components.length} registered components:`);
        
        components.forEach((component, index) => {
          console.log(`${index + 1}. ${component.name}`);
          console.log(`   Path: ${component.path}`);
          console.log(`   Template ID: ${component.templateId || 'N/A'}`);
          console.log(`   Imported At: ${new Date(component.importedAt).toLocaleString()}`);
          console.log(`   Tags: ${component.tags.join(', ')}`);
          console.log('');
        });
      }
    )
    .option('force', {
      alias: 'f',
      type: 'boolean',
      description: 'Force reimport of already registered components'
    })
    .demandCommand(1, 'You must provide a command')
    .help()
    .argv;
}

// Run the CLI
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
