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
  const [deleteConfirmPageId, setDeleteConfirmPageId] = useState<string | null>(null);
  
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
    setDeleteConfirmPageId(pageId);
  };
  
  const confirmDelete = () => {
    if (deleteConfirmPageId) {
      onDeletePage(deleteConfirmPageId);
      setDeleteConfirmPageId(null);
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirmPageId(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with branding */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm" style={{ fontFamily: 'var(--font-pacifico)' }}>
            Taral - Doodle it!
          </h1>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-3">
          <span className="text-3xl">🎨</span>
          My Doodles
        </h2>
        
        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* New Page button */}
          <button
            onClick={onNewPage}
            className="aspect-[3/2] rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-sm hover:shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
              +
            </div>
            <div className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              New Doodle
            </div>
          </button>
          
          {/* Page cards */}
          {sortedPages.map((page) => (
            <div
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className="aspect-[3/2] rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white overflow-hidden group relative transform hover:-translate-y-1"
            >
              {/* Thumbnail */}
              {page.thumbnail && (
                <img
                  src={page.thumbnail}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              
              {/* Overlay with page info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent p-4">
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
                        className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border-2 border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                        maxLength={100}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        <span className="flex-1 truncate">{page.name}</span>
                        <button
                          onClick={(e) => startEditing(e, page.id, page.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center backdrop-blur-sm"
                          aria-label="Rename page"
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-200 mt-1">{formatDate(page.lastModifiedAt)}</div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, page.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-lg font-bold text-xl hover:scale-110"
                aria-label="Delete page"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {sortedPages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl text-gray-600 font-medium">No doodles yet!</p>
            <p className="text-gray-500 mt-2">Click the "New Doodle" button to start creating</p>
          </div>
        )}
      </div>
      
      {/* Glassmorphism Delete Confirmation Modal */}
      {deleteConfirmPageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          {/* Modal */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full animate-scaleIn">
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Delete Doodle?</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete this doodle? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 rounded-xl bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 font-semibold transition-all duration-200 backdrop-blur-sm border border-gray-300/50 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold transition-all duration-200 shadow-lg hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
