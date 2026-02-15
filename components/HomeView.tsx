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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Grid background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(to right, #e0e7ff 1px, transparent 1px),
          linear-gradient(to bottom, #e0e7ff 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Decorative doodles scattered around */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Flower doodles */}
        <svg className="absolute top-20 left-10 w-16 h-16 text-pink-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '0s' }}>
          <circle cx="50" cy="50" r="15" fill="currentColor"/>
          <circle cx="35" cy="35" r="12" fill="currentColor"/>
          <circle cx="65" cy="35" r="12" fill="currentColor"/>
          <circle cx="35" cy="65" r="12" fill="currentColor"/>
          <circle cx="65" cy="65" r="12" fill="currentColor"/>
          <circle cx="50" cy="50" r="8" fill="#fbbf24"/>
        </svg>
        
        <svg className="absolute top-40 right-20 w-14 h-14 text-purple-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '1s' }}>
          <circle cx="50" cy="50" r="12" fill="currentColor"/>
          <circle cx="38" cy="38" r="10" fill="currentColor"/>
          <circle cx="62" cy="38" r="10" fill="currentColor"/>
          <circle cx="38" cy="62" r="10" fill="currentColor"/>
          <circle cx="62" cy="62" r="10" fill="currentColor"/>
          <circle cx="50" cy="50" r="6" fill="#fbbf24"/>
        </svg>
        
        {/* Tree doodle */}
        <svg className="absolute bottom-32 left-20 w-20 h-20 text-green-400 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '0.5s' }}>
          <rect x="45" y="60" width="10" height="30" fill="#92400e"/>
          <circle cx="50" cy="45" r="20" fill="currentColor"/>
          <circle cx="35" cy="35" r="15" fill="currentColor"/>
          <circle cx="65" cy="35" r="15" fill="currentColor"/>
        </svg>
        
        {/* Dress doodle */}
        <svg className="absolute top-60 right-32 w-16 h-16 text-pink-400 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '1.5s' }}>
          <path d="M 40 20 L 35 35 L 30 80 L 70 80 L 65 35 L 60 20 L 55 25 L 50 20 L 45 25 Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="15" r="8" fill="currentColor"/>
        </svg>
        
        {/* Star doodles */}
        <svg className="absolute top-1/3 left-1/4 w-12 h-12 text-yellow-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '2s' }}>
          <path d="M 50 10 L 60 40 L 90 40 L 65 60 L 75 90 L 50 70 L 25 90 L 35 60 L 10 40 L 40 40 Z" fill="currentColor"/>
        </svg>
        
        <svg className="absolute bottom-40 right-1/4 w-10 h-10 text-orange-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '2.5s' }}>
          <path d="M 50 10 L 60 40 L 90 40 L 65 60 L 75 90 L 50 70 L 25 90 L 35 60 L 10 40 L 40 40 Z" fill="currentColor"/>
        </svg>
        
        {/* Heart doodle */}
        <svg className="absolute top-1/2 right-10 w-14 h-14 text-red-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '3s' }}>
          <path d="M 50 85 C 50 85, 20 60, 20 40 C 20 25, 30 20, 40 25 C 45 27, 50 32, 50 32 C 50 32, 55 27, 60 25 C 70 20, 80 25, 80 40 C 80 60, 50 85, 50 85 Z" fill="currentColor"/>
        </svg>
        
        {/* Cloud doodle */}
        <svg className="absolute top-1/4 right-1/3 w-16 h-16 text-blue-300 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '1.2s' }}>
          <ellipse cx="50" cy="50" rx="25" ry="15" fill="currentColor"/>
          <circle cx="35" cy="50" r="15" fill="currentColor"/>
          <circle cx="65" cy="50" r="15" fill="currentColor"/>
        </svg>
        
        {/* Butterfly doodle */}
        <svg className="absolute bottom-1/4 left-1/3 w-14 h-14 text-purple-400 opacity-40 animate-float" viewBox="0 0 100 100" style={{ animationDelay: '0.8s' }}>
          <ellipse cx="35" cy="40" rx="15" ry="20" fill="currentColor"/>
          <ellipse cx="65" cy="40" rx="15" ry="20" fill="currentColor"/>
          <ellipse cx="35" cy="65" rx="12" ry="15" fill="currentColor"/>
          <ellipse cx="65" cy="65" rx="12" ry="15" fill="currentColor"/>
          <rect x="48" y="30" width="4" height="50" fill="#6b21a8"/>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with branding */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm" style={{ fontFamily: 'var(--font-pacifico)' }}>
            Taral - Doodle it!
          </h1>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 relative inline-block">
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              My Doodles
            </span>
          </span>
          {/* Decorative underline */}
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full transform -rotate-1"></div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-3 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </h2>
        
        {/* Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* New Page button */}
          <button
            onClick={onNewPage}
            className="aspect-[3/2] rounded-3xl border-3 border-dashed border-purple-400 hover:border-purple-600 bg-gradient-to-br from-white via-purple-50 to-pink-50 hover:from-purple-100 hover:via-pink-100 hover:to-orange-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 group shadow-lg hover:shadow-2xl relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-purple-400 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-6 h-6 border-2 border-pink-400 rotate-45"></div>
              <div className="absolute top-1/2 right-8 w-4 h-4 bg-orange-400 rounded-full"></div>
            </div>
            
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-4xl font-bold group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 shadow-xl">
              +
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              New Doodle
            </div>
          </button>
          
          {/* Page cards */}
          {sortedPages.map((page) => (
            <div
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className="aspect-[3/2] rounded-3xl border-3 border-transparent bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:from-purple-50 hover:via-pink-50 hover:to-orange-50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group relative transform hover:-translate-y-2 hover:rotate-1"
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full"></div>
              
              {/* Thumbnail */}
              {page.thumbnail && (
                <div className="relative w-full h-full">
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              
              {/* Overlay with page info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/70 to-transparent p-4 backdrop-blur-sm">
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
                        className="w-full px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-xl border-2 border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                        maxLength={100}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-base truncate flex items-center gap-2">
                        <span className="flex-1 truncate drop-shadow-md">{page.name}</span>
                        <button
                          onClick={(e) => startEditing(e, page.id, page.name)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md border border-white/30"
                          aria-label="Rename page"
                          title="Rename"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                        <span>🕐</span>
                        <span>{formatDate(page.lastModifiedAt)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, page.id)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center shadow-xl font-bold text-xl hover:scale-110 border-2 border-white/50"
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
