import { MediaGallery } from '@/components/dashboard/media-gallery';

export default function MediaPage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold text-primary mb-8">Media Library</h1>
      <MediaGallery />
    </div>
  );
}
