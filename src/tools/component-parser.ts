import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

/**
 * Component property information
 */
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

/**
 * Component analysis result
 */
export interface ComponentAnalysis {
  name: string;
  props: ComponentProp[];
  hasChildren: boolean;
  imports: string[];
  description?: string;
}

/**
 * Parse TypeScript AST to extract component information
 */
export function analyzeComponent(filePath: string): ComponentAnalysis {
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Create a TypeScript source file
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Initialize analysis result
  const analysis: ComponentAnalysis = {
    name: path.basename(filePath, path.extname(filePath)),
    props: [],
    hasChildren: false,
    imports: [],
    description: ''
  };
  
  // Extract imports
  extractImports(sourceFile, analysis);
  
  // Extract component name and props
  extractComponentInfo(sourceFile, analysis);
  
  // Check for children usage
  checkForChildren(sourceFile, analysis);
  
  return analysis;
}

/**
 * Extract import statements from the source file
 */
function extractImports(sourceFile: ts.SourceFile, analysis: ComponentAnalysis): void {
  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) {
      const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
      analysis.imports.push(importPath);
    }
  });
}

/**
 * Extract component information (name, props, description)
 */
function extractComponentInfo(sourceFile: ts.SourceFile, analysis: ComponentAnalysis): void {
  // Find interface declarations for props
  ts.forEachChild(sourceFile, node => {
    if (ts.isInterfaceDeclaration(node) && node.name.text.includes('Props')) {
      // Extract component name from props interface name
      const interfaceName = node.name.text;
      if (interfaceName.endsWith('Props')) {
        const componentName = interfaceName.replace('Props', '');
        if (componentName) {
          analysis.name = componentName;
        }
      }
      
      // Extract JSDoc comment for description
      const jsDoc = getJSDocComment(node);
      if (jsDoc) {
        analysis.description = jsDoc;
      }
      
      // Extract props
      node.members.forEach(member => {
        if (ts.isPropertySignature(member)) {
          const propName = member.name.getText(sourceFile);
          const isRequired = !member.questionToken;
          let propType = 'any';
          
          // Get prop type
          if (member.type) {
            propType = member.type.getText(sourceFile);
          }
          
          // Get prop description from JSDoc
          const propJsDoc = getJSDocComment(member);
          
          // Create prop object
          const prop: ComponentProp = {
            name: propName,
            type: propType,
            required: isRequired,
            description: propJsDoc
          };
          
          analysis.props.push(prop);
        }
      });
    }
  });
  
  // If no interface was found, look for function component
  if (analysis.props.length === 0) {
    ts.forEachChild(sourceFile, node => {
      if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
        // Extract function component props
        extractFunctionComponentProps(node, sourceFile, analysis);
      }
    });
  }
}

/**
 * Extract props from a function component
 */
function extractFunctionComponentProps(
  node: ts.Node, 
  sourceFile: ts.SourceFile, 
  analysis: ComponentAnalysis
): void {
  // Handle function declaration
  if (ts.isFunctionDeclaration(node) && node.name) {
    analysis.name = node.name.text;
    
    // Extract JSDoc comment for description
    const jsDoc = getJSDocComment(node);
    if (jsDoc) {
      analysis.description = jsDoc;
    }
    
    // Extract parameters
    if (node.parameters.length > 0) {
      const propsParam = node.parameters[0];
      if (propsParam.type && ts.isTypeLiteralNode(propsParam.type)) {
        // Inline props definition
        propsParam.type.members.forEach(member => {
          if (ts.isPropertySignature(member)) {
            const propName = member.name.getText(sourceFile);
            const isRequired = !member.questionToken;
            let propType = 'any';
            
            if (member.type) {
              propType = member.type.getText(sourceFile);
            }
            
            analysis.props.push({
              name: propName,
              type: propType,
              required: isRequired
            });
          }
        });
      } else if (propsParam.type) {
        // Reference to a type
        const typeName = propsParam.type.getText(sourceFile);
        // Find the type definition
        ts.forEachChild(sourceFile, typeNode => {
          if (
            ts.isInterfaceDeclaration(typeNode) && 
            typeNode.name.text === typeName.replace('Props', '')
          ) {
            typeNode.members.forEach(member => {
              if (ts.isPropertySignature(member)) {
                const propName = member.name.getText(sourceFile);
                const isRequired = !member.questionToken;
                let propType = 'any';
                
                if (member.type) {
                  propType = member.type.getText(sourceFile);
                }
                
                const propJsDoc = getJSDocComment(member);
                
                analysis.props.push({
                  name: propName,
                  type: propType,
                  required: isRequired,
                  description: propJsDoc
                });
              }
            });
          }
        });
      }
    }
  }
  
  // Handle variable declaration (const Component = ...)
  if (ts.isVariableStatement(node)) {
    node.declarationList.declarations.forEach(declaration => {
      if (
        ts.isIdentifier(declaration.name) && 
        declaration.initializer && 
        (
          ts.isArrowFunction(declaration.initializer) || 
          ts.isFunctionExpression(declaration.initializer)
        )
      ) {
        analysis.name = declaration.name.text;
        
        // Extract JSDoc comment for description
        const jsDoc = getJSDocComment(node);
        if (jsDoc) {
          analysis.description = jsDoc;
        }
        
        const initializer = declaration.initializer as ts.ArrowFunction | ts.FunctionExpression;
        
        // Extract parameters
        if (initializer.parameters.length > 0) {
          const propsParam = initializer.parameters[0];
          
          if (propsParam.type && ts.isTypeLiteralNode(propsParam.type)) {
            // Inline props definition
            propsParam.type.members.forEach(member => {
              if (ts.isPropertySignature(member)) {
                const propName = member.name.getText(sourceFile);
                const isRequired = !member.questionToken;
                let propType = 'any';
                
                if (member.type) {
                  propType = member.type.getText(sourceFile);
                }
                
                analysis.props.push({
                  name: propName,
                  type: propType,
                  required: isRequired
                });
              }
            });
          } else if (propsParam.type) {
            // Reference to a type
            const typeName = propsParam.type.getText(sourceFile);
            
            // Find the type definition
            ts.forEachChild(sourceFile, typeNode => {
              if (
                (ts.isInterfaceDeclaration(typeNode) || ts.isTypeAliasDeclaration(typeNode)) && 
                typeNode.name.text === typeName
              ) {
                if (ts.isInterfaceDeclaration(typeNode)) {
                  typeNode.members.forEach(member => {
                    if (ts.isPropertySignature(member)) {
                      const propName = member.name.getText(sourceFile);
                      const isRequired = !member.questionToken;
                      let propType = 'any';
                      
                      if (member.type) {
                        propType = member.type.getText(sourceFile);
                      }
                      
                      const propJsDoc = getJSDocComment(member);
                      
                      analysis.props.push({
                        name: propName,
                        type: propType,
                        required: isRequired,
                        description: propJsDoc
                      });
                    }
                  });
                }
              }
            });
          }
        }
      }
    });
  }
}

/**
 * Check if the component uses children
 */
function checkForChildren(sourceFile: ts.SourceFile, analysis: ComponentAnalysis): void {
  let hasChildren = false;
  
  // Check for children in props
  analysis.props.forEach(prop => {
    if (prop.name === 'children' || prop.type.includes('ReactNode') || prop.type.includes('ReactElement')) {
      hasChildren = true;
    }
  });
  
  // Check for children in JSX
  if (!hasChildren) {
    ts.forEachChild(sourceFile, node => {
      const visitor = (node: ts.Node): void => {
        if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
          // Check if this is the component's return value
          const jsxContent = node.getText(sourceFile);
          if (jsxContent.includes('{children}')) {
            hasChildren = true;
          }
        }
        
        ts.forEachChild(node, visitor);
      };
      
      visitor(node);
    });
  }
  
  analysis.hasChildren = hasChildren;
}

/**
 * Extract JSDoc comment from a node
 */
function getJSDocComment(node: ts.Node): string | undefined {
  const jsDocComments = (node as any).jsDoc;
  if (jsDocComments && jsDocComments.length > 0) {
    return jsDocComments[0].comment;
  }
  
  // Try to get the full text of the node and extract comments manually
  const fullText = node.getFullText();
  const commentRegex = /\/\*\*([\s\S]*?)\*\//;
  const match = fullText.match(commentRegex);
  
  if (match && match[1]) {
    // Clean up the comment
    return match[1]
      .replace(/^\s*\*\s*/gm, '') // Remove * at the beginning of lines
      .trim();
  }
  
  return undefined;
}
