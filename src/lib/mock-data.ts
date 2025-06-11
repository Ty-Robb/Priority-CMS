
import type { ContentPiece, PageStructure } from '@/types';

// Example PageStructure for the first blog post
const aiContentPageStructure: PageStructure = {
  id: "page-ai-future",
  title: "The Future of AI in Content Creation (Structured)",
  blocks: [
    {
      id: "block-ai-h1",
      type: "text",
      props: { text: "The Evolving Landscape of AI in Content Creation", level: "h1" }
    },
    {
      id: "block-ai-intro-p",
      type: "text",
      props: { text: "Artificial Intelligence (AI) is rapidly transforming the landscape of content creation. From automated journalism to AI-powered copywriting tools, the possibilities seem endless. This structured content provides a richer way to represent this article.", level: "p" }
    },
    {
      id: "block-ai-img-1",
      type: "image",
      props: { src: "https://placehold.co/800x350.png", alt: "AI and Content Creation", dataAiHint: "AI technology", width: 800, height: 350 }
    },
    {
      id: "block-ai-impact-h2",
      type: "text",
      props: { text: "Significant Impacts of AI", level: "h2" }
    },
    {
      id: "block-ai-impact-p1",
      type: "text",
      props: { text: "One of the most significant impacts of AI is its ability to analyze vast amounts of data and identify trends, which can then be used to generate highly relevant and engaging content. This can save content creators significant time and resources.", level: "p" }
    },
    {
      id: "block-ai-impact-p2",
      type: "text",
      props: { text: "Furthermore, AI tools can assist with tasks such as grammar checking, style improvement, and even generating entire articles from a set of keywords or a brief outline. While the human touch remains crucial for creativity and nuance, AI serves as a powerful assistant, augmenting human capabilities rather than replacing them entirely.", level: "p" }
    },
    {
      id: "block-ai-quote-1",
      type: "quote",
      props: { text: "AI promises a future where content is more personalized, data-driven, and accessible than ever before.", citation: "VertexCMS Insights" }
    },
    {
      id: "block-ai-ethics-p",
      type: "text",
      props: { text: "The ethical implications of AI in content creation, such as concerns about plagiarism and the spread of misinformation, also need careful consideration as the technology continues to evolve. However, with responsible development and deployment, AI can be a force for good.", level: "p" }
    },
     {
      id: 'block-ai-list-1',
      type: 'list',
      props: {
        ordered: false,
        items: [
          { id: 'item-ai-1', text: 'Enhanced Personalization' },
          { id: 'item-ai-2', text: 'Improved Efficiency' },
          { id: 'item-ai-3', text: 'Data-Driven Insights' },
        ],
      },
    },
  ]
};

// Centralized mock data source
export const mockContentData: ContentPiece[] = [
  {
    id: "1",
    title: "The Future of AI in Content Creation",
    status: "Published",
    contentType: "Blog Post",
    keywords: ["AI", "content", "future"],
    generatedHeadlines: ["AI: Revolutionizing Content", "The Next Wave of Content with AI"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    body: "Artificial Intelligence (AI) is rapidly transforming the landscape of content creation. From automated journalism to AI-powered copywriting tools, the possibilities seem endless.\n\nOne of the most significant impacts of AI is its ability to analyze vast amounts of data and identify trends, which can then be used to generate highly relevant and engaging content. This can save content creators significant time and resources.\n\nFurthermore, AI tools can assist with tasks such as grammar checking, style improvement, and even generating entire articles from a set of keywords or a brief outline. While the human touch remains crucial for creativity and nuance, AI serves as a powerful assistant, augmenting human capabilities rather than replacing them entirely.\n\nThe ethical implications of AI in content creation, such as concerns about plagiarism and the spread of misinformation, also need careful consideration as the technology continues to evolve. However, with responsible development and deployment, AI promises a future where content is more personalized, data-driven, and accessible than ever before.",
    pageStructure: aiContentPageStructure, // Assigning the structured content
  },
  {
    id: "2",
    title: "Top 10 React Best Practices",
    status: "Draft",
    contentType: "Technical Article",
    keywords: ["React", "best practices", "development"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    body: "This is the body of the React best practices article. It needs more content before publishing.",
  },
   {
    id: "3",
    title: "About Us - Our Company Story",
    status: "Published",
    contentType: "Page",
    keywords: ["company", "about", "mission"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    body: "Our company was founded in 2024 with a mission to revolutionize content management through AI. We believe in empowering creators with tools that enhance their productivity and creativity.",
  },
   {
    id: "4",
    title: "Understanding Server Components - A Deep Dive",
    status: "Archived",
    contentType: "Blog Post",
    keywords: ["Server Components", "React", "Next.js"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    body: "This article explores the intricacies of Next.js Server Components, their benefits, and use cases. It has been archived as newer patterns have emerged.",
  },
   {
    id: "5",
    title: "Project Alpha Showcase",
    status: "Published",
    contentType: "Portfolio Item",
    keywords: ["case study", "project", "design"],
    generatedHeadlines: [],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    body: "Detailed description of Project Alpha, showcasing innovative design and user experience strategies implemented for a leading tech client.",
  },
];
