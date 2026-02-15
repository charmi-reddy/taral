'use client';

import { useState } from 'react';
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
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  
  // Sort pages by last modified date (most recent first)
  const sortedPages = [...pages].sort((a, b) => b.lastModifiedAt - a.lastModifiedAt);
  
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
  
  const startEditing = (e: React.MouseEvent, pageId: string, currentName: string) => {
    e.stopPropagation();
    setEditingPageId(pageId);
    setEditingName(currentName);
  };
  
  const cancelEditing = () => {
    setEditingPageId(null);
    setEditingName('');
  };
  
  const saveEdit = (pageId: string) => {
    const trimmedName = editingName.trim();
    
    // Validate name
    if (trimmedName.length === 0) {
      alert('Page name cannot be empty');
      return;
    }
    
    if (trimmedName.length > 100) {
      alert('Page name cannot exceed 100 characters');
      return;
    }
    
    onRenamePage(pageId, editingName);
    cancelEditing();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(pageId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
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
                  {editingPageId === page.id ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, page.id)}
                        onBlur={() => saveEdit(page.id)}
                        autoFocus
                        className="w-full px-2 py-1 text-sm font-medium text-gray-900 bg-white rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={100}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        <span className="flex-1 truncate">{page.name}</span>
                        <button
                          onClick={(e) => startEditing(e, page.id, page.name)}
                          className="opacity-0 group-hover:opacity-100 transition flex-shrink-0 w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center"
                          aria-label="Rename page"
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-300">{formatDate(page.lastModifiedAt)}</div>
                    </>
                  )}
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
