import { Leaf } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 text-primary" aria-label="VertexCMS Logo">
      <Leaf className="h-8 w-8" />
      <span className="font-headline text-2xl font-semibold">VertexCMS</span>
    </div>
  );
}
