'use client';

import { PageMetadata } from '@/lib/page-manager/types';

interface HomeViewProps {
  pages: PageMetadata[];
  onPageSelect: (pageId: string) => void;
  onNewPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
}

export default function HomeView({
  pages,
  onPageSelect,
  onNewPage,
  onDeletePage,
  onRenamePage,
}: HomeViewProps) {
  // Sort pages by last modified date (most recent first)
  const sortedPages = [...pages].sort((a, b) => b.lastModified - a.lastModified);
  
  // Format timestamp as human-readable date
  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Fall back to absolute date
    return new Date(timestamp).toLocaleDateString();
  };
  
  const handleDelete = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      onDeletePage(pageId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          My Doodles
        </h1>
        
        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* New Page button */}
          <button
            onClick={onNewPage}
            className="aspect-[3/2] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2 group"
          >
            <div className="text-4xl text-gray-400 group-hover:text-blue-500 transition">+</div>
            <div className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition">
              New Page
            </div>
          </button>
          
          {/* Page cards */}
          {sortedPages.map((page) => (
            <div
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className="aspect-[3/2] rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer bg-white overflow-hidden group relative"
            >
              {/* Thumbnail */}
              {page.thumbnail && (
                <img
                  src={page.thumbnail}
                  alt={page.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay with page info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="text-white">
                  <div className="font-medium text-sm truncate">{page.name}</div>
                  <div className="text-xs text-gray-300">{formatDate(page.lastModified)}</div>
                </div>
              </div>
              
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, page.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                aria-label="Delete page"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {sortedPages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No pages yet. Create your first doodle!</p>
          </div>
        )}
      </div>
    </div>
  );
}
