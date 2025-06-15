import React from 'react';
import TemplateList from '@/components/dashboard/template-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates | Priority CMS',
  description: 'Manage your content templates',
};

export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <TemplateList />
    </div>
  );
}
