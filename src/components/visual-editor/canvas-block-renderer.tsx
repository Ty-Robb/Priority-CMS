
"use client";

import type { KeyboardEvent} from 'react';
import React, { useState, useEffect } from 'react';
import type { VisualBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, ContainerBlockProps, ListBlockProps, QuoteBlockProps, ListItemType, VisualBlockPropsUnion, PageStructure } from '@/types';
import Image from 'next/image';
import { Button as ShadCnButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit, PlusCircle } from 'lucide-react'; // Added PlusCircle
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area';


interface CanvasBlockRendererProps {
  block: VisualBlock;
  onUpdateBlock: (blockId: string, newProps: Partial<VisualBlockPropsUnion>) => void;
  onDeleteBlock: (blockId: string) => void;
  pageStructure: PageStructure; 
  onUpdatePageStructure: (updatedPage: PageStructure) => void; 
}

export function CanvasBlockRenderer({ block, onUpdateBlock, onDeleteBlock, pageStructure, onUpdatePageStructure }: CanvasBlockRendererProps) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editableContent, setEditableContent] = useState(''); 
  const [editableLevel, setEditableLevel] = useState<TextBlockProps['level']>('p');

  const [isImageEditOpen, setIsImageEditOpen] = useState(false);
  const [currentImageProps, setCurrentImageProps] = useState<Partial<ImageBlockProps>>({});

  const [isButtonEditOpen, setIsButtonEditOpen] = useState(false);
  const [currentButtonProps, setCurrentButtonProps] = useState<Partial<ButtonBlockProps>>({});

  const [isQuoteEditOpen, setIsQuoteEditOpen] = useState(false);
  const [currentQuoteProps, setCurrentQuoteProps] = useState<Partial<QuoteBlockProps>>({});

  const [isListEditOpen, setIsListEditOpen] = useState(false);
  const [currentListProps, setCurrentListProps] = useState<Partial<ListBlockProps>>({ items: [], ordered: false });


  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: block.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
    position: 'relative' as 'relative',
  };

  useEffect(() => {
    if (block.type === 'text') {
      const props = block.props as TextBlockProps;
      setEditableContent(props.text);
      setEditableLevel(props.level || 'p');
    }
  }, [block.props, block.type]);


  const handleTextDoubleClick = () => {
    if (block.type === 'text') { 
      const props = block.props as TextBlockProps;
      setEditableContent(props.text); 
      setEditableLevel(props.level || 'p'); 
      setIsEditingText(true);
    }
  };

  const handleTextContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(event.target.value);
  };

  const handleTextLevelChange = (newLevel: TextBlockProps['level']) => {
    setEditableLevel(newLevel);
    if (block.type === 'text') {
      onUpdateBlock(block.id, { level: newLevel } as Partial<TextBlockProps>);
    }
  };

  const handleTextBlur = () => {
    if (block.type === 'text') {
      const currentProps = block.props as TextBlockProps;
      if (currentProps.text !== editableContent) {
        onUpdateBlock(block.id, { text: editableContent } as Partial<TextBlockProps>);
      }
    }
    setIsEditingText(false);
  };
  
  const handleTextKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && block.type === 'text') { 
      event.preventDefault(); 
      handleTextBlur();
    } else if (event.key === 'Escape') {
       if (block.type === 'text') {
        const props = block.props as TextBlockProps;
        setEditableContent(props.text); 
        setEditableLevel(props.level || 'p');
      }
      setIsEditingText(false);
    }
  };

  const handleOpenImageEditDialog = () => {
    if (block.type === 'image') {
      setCurrentImageProps(block.props as ImageBlockProps);
      setIsImageEditOpen(true);
    }
  };

  const handleImagePropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentImageProps(prev => ({ 
      ...prev, 
      [name]: (name === 'width' || name === 'height') ? (value === '' ? undefined : Number(value)) : value 
    }));
  };

  const handleSaveImageProps = () => {
    onUpdateBlock(block.id, currentImageProps);
    setIsImageEditOpen(false);
  };

  const handleOpenButtonEditDialog = () => {
    if (block.type === 'button') {
      setCurrentButtonProps(block.props as ButtonBlockProps);
      setIsButtonEditOpen(true);
    }
  };

  const handleButtonPropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentButtonProps(prev => ({ ...prev, [name]: value }));
  };

  const handleButtonVariantChange = (variant: ButtonBlockProps['variant']) => {
    setCurrentButtonProps(prev => ({ ...prev, variant }));
  };

  const handleSaveButtonProps = () => {
    onUpdateBlock(block.id, currentButtonProps);
    setIsButtonEditOpen(false);
  };

  const handleOpenQuoteEditDialog = () => {
    if (block.type === 'quote') {
      setCurrentQuoteProps(block.props as QuoteBlockProps);
      setIsQuoteEditOpen(true);
    }
  };

  const handleQuotePropChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuoteProps(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveQuoteProps = () => {
    onUpdateBlock(block.id, currentQuoteProps);
    setIsQuoteEditOpen(false);
  };

  const handleOpenListEditDialog = () => {
    if (block.type === 'list') {
      const props = block.props as ListBlockProps;
      setCurrentListProps({ 
        items: props.items.map(item => ({ ...item })), 
        ordered: props.ordered 
      });
      setIsListEditOpen(true);
    }
  };

  const handleListItemTextChange = (itemId: string, newText: string) => {
    setCurrentListProps(prev => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, text: newText } : item
        ),
      };
    });
  };

  const handleListOrderedChange = (ordered: string) => { 
    setCurrentListProps(prev => ({
      ...prev,
      ordered: ordered === 'true',
    }));
  };

  const handleAddNewListItem = () => {
    setCurrentListProps(prev => {
      if (!prev) return prev; // Should not happen
      const newItemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItems = [...(prev.items || []), { id: newItemId, text: '' }];
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const handleDeleteListItem = (itemIdToDelete: string) => {
    setCurrentListProps(prev => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.filter(item => item.id !== itemIdToDelete),
      };
    });
  };
  
  const handleSaveListProps = () => {
    onUpdateBlock(block.id, currentListProps);
    setIsListEditOpen(false);
  };


  const renderBlockContent = () => {
    switch (block.type) {
      case 'text': {
        const props = block.props as TextBlockProps;
        const Tag = props.level || 'p';
        
        if (isEditingText) {
          return (
            <div className="my-2 space-y-2">
              <Textarea
                value={editableContent}
                onChange={handleTextContentChange}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                className={`w-full min-h-[80px] resize-y text-base ${Tag !== 'p' ? 'font-bold' : ''} ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : Tag === 'h4' ? 'text-xl' : Tag === 'h5' ? 'text-lg' : '' }`}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <Label htmlFor={`level-select-${block.id}`} className="text-sm font-medium">Style:</Label>
                <Select
                  value={editableLevel}
                  onValueChange={(value) => handleTextLevelChange(value as TextBlockProps['level'])}
                >
                  <SelectTrigger id={`level-select-${block.id}`} className="w-[180px]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p">Paragraph</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                    <SelectItem value="h2">Heading 2</SelectItem>
                    <SelectItem value="h3">Heading 3</SelectItem>
                    <SelectItem value="h4">Heading 4</SelectItem>
                    <SelectItem value="h5">Heading 5</SelectItem>
                    <SelectItem value="h6">Heading 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        }
        return (
          <Tag 
            onDoubleClick={handleTextDoubleClick} 
            title="Double-click to edit"
            className={`my-2 cursor-pointer hover:bg-muted/30 ${Tag !== 'p' ? 'font-bold' : ''} ${Tag === 'h1' ? 'text-4xl' : Tag === 'h2' ? 'text-3xl' : Tag === 'h3' ? 'text-2xl' : Tag === 'h4' ? 'text-xl' : Tag === 'h5' ? 'text-lg' : '' }`}
          >
            {props.text}
          </Tag>
        );
      }
      case 'image': {
        const props = block.props as ImageBlockProps;
        return (
          <div className="my-4 relative group/image">
            <Image
              src={props.src || `https://placehold.co/${props.width || 600}x${props.height || 400}.png`}
              alt={props.alt || 'Placeholder image'}
              width={props.width || 600}
              height={props.height || 400}
              className="rounded-md shadow-md object-cover"
              data-ai-hint={props.dataAiHint || "placeholder image"}
            />
          </div>
        );
      }
      case 'button': {
        const props = block.props as ButtonBlockProps;
        if (props.href) {
          return (
            <ShadCnButton variant={props.variant || 'default'} className="my-2" asChild>
              <a href={props.href} target="_blank" rel="noopener noreferrer">{props.text}</a>
            </ShadCnButton>
          );
        }
        return (
          <ShadCnButton variant={props.variant || 'default'} className="my-2">
            {props.text}
          </ShadCnButton>
        );
      }
      case 'container': {
        return (
          <div className="my-2 p-4 border border-dashed border-muted rounded-md">
            {block.children && block.children.map(childBlock => (
              <CanvasBlockRenderer 
                key={childBlock.id} 
                block={childBlock} 
                onUpdateBlock={onUpdateBlock}
                onDeleteBlock={onDeleteBlock}
                pageStructure={pageStructure}
                onUpdatePageStructure={onUpdatePageStructure}
              />
            ))}
          </div>
        );
      }
      case 'list': {
        const props = block.props as ListBlockProps;
        const ListTag = props.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`my-2 pl-5 ${props.ordered ? 'list-decimal' : 'list-disc'}`}>
            {props.items.map((item: ListItemType) => (
              <li key={item.id} className="mb-1">{item.text}</li>
            ))}
          </ListTag>
        );
      }
      case 'quote': {
        const props = block.props as QuoteBlockProps;
        return (
          <blockquote className="my-4 p-4 border-l-4 border-primary bg-muted/50 rounded-r-md italic">
            <p className="mb-2">{props.text}</p>
            {props.citation && (
              <footer className="text-sm text-muted-foreground">
                <cite>— {props.citation}</cite>
              </footer>
            )}
          </blockquote>
        );
      }
      default:
        return <div className="p-2 my-2 border border-red-500 rounded-md bg-red-50 text-red-700">Unknown block type: {block.type}</div>;
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-2 relative group bg-background p-2 rounded hover:shadow-md transition-shadow">
       <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
          <Button 
            {...attributes} 
            {...listeners}
            variant="ghost"
            size="icon"
            className="p-1 text-muted-foreground hover:text-primary cursor-grab active:cursor-grabbing h-7 w-7"
            aria-label="Drag to reorder block"
          >
            <GripVertical size={16} />
          </Button>
          {(block.type === 'image' || block.type === 'button' || block.type === 'quote' || block.type === 'list') && (
            <Button
              variant="ghost"
              size="icon"
              className="p-1 text-muted-foreground hover:text-primary h-7 w-7"
              aria-label={`Edit ${block.type} properties`}
              onClick={
                block.type === 'image' ? handleOpenImageEditDialog :
                block.type === 'button' ? handleOpenButtonEditDialog :
                block.type === 'quote' ? handleOpenQuoteEditDialog :
                block.type === 'list' ? handleOpenListEditDialog :
                undefined
              }
            >
              <Edit size={16} />
            </Button>
          )}
          <Button 
            variant="ghost"
            size="icon"
            className="p-1 text-muted-foreground hover:text-destructive h-7 w-7"
            aria-label="Delete block"
            onClick={() => onDeleteBlock(block.id)}
          >
            <Trash2 size={16} />
          </Button>
       </div>
      {renderBlockContent()}

      {block.type === 'image' && (
        <Dialog open={isImageEditOpen} onOpenChange={setIsImageEditOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Image Properties</DialogTitle>
              <DialogDescription>
                Update the details for your image block. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="img-src" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="img-src"
                  name="src"
                  value={currentImageProps.src || ''}
                  onChange={handleImagePropChange}
                  className="col-span-3"
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="img-alt" className="text-right">
                  Alt Text
                </Label>
                <Input
                  id="img-alt"
                  name="alt"
                  value={currentImageProps.alt || ''}
                  onChange={handleImagePropChange}
                  className="col-span-3"
                  placeholder="Descriptive text for the image"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="img-width" className="text-right">
                  Width (px)
                </Label>
                <Input
                  id="img-width"
                  name="width"
                  type="number"
                  value={currentImageProps.width === undefined ? '' : currentImageProps.width}
                  onChange={handleImagePropChange}
                  className="col-span-3"
                  placeholder="e.g., 600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="img-height" className="text-right">
                  Height (px)
                </Label>
                <Input
                  id="img-height"
                  name="height"
                  type="number"
                  value={currentImageProps.height === undefined ? '' : currentImageProps.height}
                  onChange={handleImagePropChange}
                  className="col-span-3"
                  placeholder="e.g., 400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="img-dataAiHint" className="text-right">
                  AI Hint
                </Label>
                <Input
                  id="img-dataAiHint"
                  name="dataAiHint"
                  value={currentImageProps.dataAiHint || ''}
                  onChange={handleImagePropChange}
                  className="col-span-3"
                  placeholder="e.g., 'modern art'"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveImageProps}>
                Update Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {block.type === 'button' && (
         <Dialog open={isButtonEditOpen} onOpenChange={setIsButtonEditOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Button Properties</DialogTitle>
              <DialogDescription>
                Customize the text, appearance, and link for your button.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="btn-text" className="text-right">
                  Button Text
                </Label>
                <Input
                  id="btn-text"
                  name="text"
                  value={currentButtonProps.text || ''}
                  onChange={handleButtonPropChange}
                  className="col-span-3"
                  placeholder="e.g., Learn More"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="btn-variant" className="text-right">
                  Variant
                </Label>
                <Select
                  value={currentButtonProps.variant || 'default'}
                  onValueChange={(value) => handleButtonVariantChange(value as ButtonBlockProps['variant'])}
                >
                  <SelectTrigger id="btn-variant" className="col-span-3">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="btn-href" className="text-right">
                  URL (Optional)
                </Label>
                <Input
                  id="btn-href"
                  name="href"
                  value={currentButtonProps.href || ''}
                  onChange={handleButtonPropChange}
                  className="col-span-3"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveButtonProps}>
                Update Button
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {block.type === 'quote' && (
         <Dialog open={isQuoteEditOpen} onOpenChange={setIsQuoteEditOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Quote Properties</DialogTitle>
              <DialogDescription>
                Modify the text and citation for your quote block.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quote-text" className="text-right pt-2 self-start">
                  Quote Text
                </Label>
                <Textarea
                  id="quote-text"
                  name="text"
                  value={currentQuoteProps.text || ''}
                  onChange={handleQuotePropChange}
                  className="col-span-3 min-h-[100px]"
                  placeholder="The main text of the quotation..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quote-citation" className="text-right">
                  Citation (Optional)
                </Label>
                <Input
                  id="quote-citation"
                  name="citation"
                  value={currentQuoteProps.citation || ''}
                  onChange={handleQuotePropChange}
                  className="col-span-3"
                  placeholder="e.g., Author Name, Book Title"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveQuoteProps}>
                Update Quote
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {block.type === 'list' && (
         <Dialog open={isListEditOpen} onOpenChange={setIsListEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit List Properties</DialogTitle>
              <DialogDescription>
                Modify the list items and type. Add or remove items as needed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4 mb-4">
                <Label htmlFor="list-type" className="text-right">
                  List Type
                </Label>
                <Select
                  value={currentListProps.ordered ? 'true' : 'false'}
                  onValueChange={handleListOrderedChange}
                >
                  <SelectTrigger id="list-type" className="col-span-3">
                    <SelectValue placeholder="Select list type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Unordered (bullet points)</SelectItem>
                    <SelectItem value="true">Ordered (numbered)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Label className="col-span-4 font-medium">List Items:</Label>
              <ScrollArea className="max-h-[250px] pr-3">
                <div className="space-y-3">
                  {currentListProps.items?.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        id={`list-item-${item.id}`}
                        value={item.text}
                        onChange={(e) => handleListItemTextChange(item.id, e.target.value)}
                        className="flex-grow" 
                        placeholder={`Item ${index + 1} text`}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDeleteListItem(item.id)}
                        aria-label={`Delete item ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddNewListItem} 
                className="mt-2 w-full"
              >
                <PlusCircle size={16} className="mr-2" /> Add New Item
              </Button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveListProps}>
                Update List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
