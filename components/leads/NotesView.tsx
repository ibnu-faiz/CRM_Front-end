// components/leads/NotesView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Edit, Trash2, Calendar } from 'lucide-react';
import AddNoteModal from './AddNotesModal';

const mockNotes = [
  {
    id: 1,
    title: 'This is note title',
    content: "She's interested in our new product line and wants our very best price. Please include a detailed breakdown of costs.",
    author: 'Note by',
    date: 'July 25, 2025',
    image: true,
  },
];

interface NotesViewProps {
  leadId: string;
}

export default function NotesView({ leadId }: NotesViewProps) {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  const handleEditNote = (noteId: number) => {
    setSelectedNote(noteId);
    setIsAddNoteOpen(true);
  };

  const handleDeleteNote = (noteId: number) => {
    console.log('Delete note:', noteId);
    // Implement delete logic
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button */}
      {/* <div className="flex justify-end">
        <Button
          onClick={() => setIsAddNoteOpen(true)}
          className="bg-gray-800 hover:bg-gray-700"
        >
          + Add Note
        </Button>
      </div> */}

      {/* Notes List */}
      <div className="space-y-4">
        {mockNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Note Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{note.title}</h4>
                    <p className="text-sm text-gray-500">{note.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{note.date}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditNote(note.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Note Content */}
              <p className="text-gray-700 mb-4">{note.content}</p>

              {/* Note Image/Attachment */}
              {note.image && (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Image attachment</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Note Modal */}
      <AddNoteModal
        open={isAddNoteOpen}
        onOpenChange={(open) => {
          setIsAddNoteOpen(open);
          if (!open) setSelectedNote(null);
        }}
        noteId={selectedNote}
      />
    </div>
  );
}