# VertexCMS (Priority CMS)

VertexCMS is a modern content management system built with Next.js, Tailwind CSS, and Firebase, enhanced with AI capabilities powered by Google's Gemini model. It provides a powerful yet intuitive interface for creating, managing, and publishing digital content.

![VertexCMS Logo](https://placehold.co/600x200.png?text=VertexCMS)

## Features

### Content Creation & Management
- **Visual Editor:** Create and edit content using a user-friendly drag-and-drop interface with multiple block types (text, images, buttons, lists, quotes).
- **AI-Powered Content Assistant:** Generate content, headlines, and keyword suggestions using Google's Gemini AI.
- **Content Management:** Organize, publish, and archive your content with a comprehensive management interface.

### Media Management
- **Media Gallery:** Upload, organize, and manage your images and documents.
- **User-Specific Libraries:** Media assets are organized by user for better organization.

### User Authentication
- **Secure Authentication:** User accounts and authentication powered by Firebase.
- **Protected Routes:** Secure access to dashboard and management features.

### Publishing & Display
- **Blog Display:** Beautifully formatted public-facing blog posts.
- **Responsive Design:** Content looks great on all devices.

## Technologies Used

- **Frontend Framework:** Next.js 15.3.3
- **Language:** TypeScript
- **Styling:** Tailwind CSS with shadcn/ui components
- **Authentication & Storage:** Firebase
- **AI Integration:** GenKit with Google AI (Gemini 2.0 Flash)
- **Drag and Drop:** dnd-kit
- **Form Handling:** React Hook Form with Zod validation

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
  - `/ui` - UI components (buttons, cards, etc.)
  - `/dashboard` - Dashboard-specific components
  - `/visual-editor` - Visual editor components
  - `/public` - Public-facing components
  - `/auth` - Authentication components
- `/src/contexts` - React context providers
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and libraries
- `/src/types` - TypeScript type definitions
- `/src/ai` - AI integration with GenKit

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Priority-CMS.git
   cd Priority-CMS
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## AI Features

VertexCMS integrates with Google's Gemini AI model to provide several AI-powered features:

- **Headline Generation:** Generate compelling headline options for your content.
- **Keyword Suggestions:** Get AI-driven keyword recommendations to optimize your content for search engines.
- **Content Generation:** Create initial content drafts based on prompts.
- **Natural Language Interface:** Interact with the AI assistant through a chat interface to build pages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [GenKit](https://genkit.dev/)
- [Google AI](https://ai.google.dev/)
