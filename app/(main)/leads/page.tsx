// app/(main)/leads/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Archive, Filter, LayoutGrid, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import LeadsKanban from '@/components/leads/LeadsKanban';
import CreateLeadModal from '@/components/leads/CreateLeadModal';

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (e: React.DragEvent, zone: 'delete' | 'won' | 'lost') => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const leadTitle = e.dataTransfer.getData('leadTitle');
    
    setDragOverZone(null);

    // Handle different actions
    if (zone === 'delete') {
      const confirmed = window.confirm(`Are you sure you want to delete "${leadTitle}"?`);
      if (confirmed) {
        console.log('Delete lead:', leadId);
        // TODO: Call API to delete lead
      }
    } else if (zone === 'won') {
      console.log('Mark lead as WON:', leadId);
      // TODO: Call API to update lead status to won
    } else if (zone === 'lost') {
      console.log('Mark lead as LOST:', leadId);
      // TODO: Call API to update lead status to lost
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">Showing data from current month</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="bg-gray-800 hover:bg-gray-700 gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Chat
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900'
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Archive className="w-4 h-4" />
            Archive
          </Button>

          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400" style={{ width: '40%' }} />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <LeadsKanban />
      </div>

      {/* Drag Zones */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            dragOverZone === 'delete'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, 'delete')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'delete')}
        >
          <p className={`font-medium ${dragOverZone === 'delete' ? 'text-red-600' : 'text-gray-500'}`}>
            DELETE
          </p>
          {dragOverZone === 'delete' && (
            <p className="text-xs text-red-600 mt-1">Drop here to delete</p>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            dragOverZone === 'won'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, 'won')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'won')}
        >
          <p className={`font-medium ${dragOverZone === 'won' ? 'text-green-600' : 'text-gray-500'}`}>
            WON
          </p>
          {dragOverZone === 'won' && (
            <p className="text-xs text-green-600 mt-1">Drop here to mark as won</p>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            dragOverZone === 'lost'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => handleDragOver(e, 'lost')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'lost')}
        >
          <p className={`font-medium ${dragOverZone === 'lost' ? 'text-orange-600' : 'text-gray-500'}`}>
            LOST
          </p>
          {dragOverZone === 'lost' && (
            <p className="text-xs text-orange-600 mt-1">Drop here to mark as lost</p>
          )}
        </div>
      </div>

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}