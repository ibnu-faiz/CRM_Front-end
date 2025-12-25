'use client';

interface LeadsDropZoneProps {
  isDragging: boolean;
  dragOverZone: string | null;
  onDragOver: (e: React.DragEvent, zone: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, zone: "delete" | "won" | "lost") => void;
}

export default function LeadsDropZone({
  isDragging,
  dragOverZone,
  onDragOver,
  onDragLeave,
  onDrop
}: LeadsDropZoneProps) {
  
  // Jika tidak sedang drag, jangan render apapun agar tidak memakan tempat layout
  if (!isDragging) return null;

  return (
   <div 
      className="absolute bottom-0 left-0 w-full z-50 px-6 pb-6 pt-12 bg-gradient-to-t from-white via-white/95 to-transparent animate-in slide-in-from-bottom-10 fade-in duration-200"
    >
      <div className="w-full h-full grid grid-cols-3 gap-4 md:gap-6">
        
        {/* Zona DELETE */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            dragOverZone === "delete"
              ? "border-red-600 bg-red-100 scale-105"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => onDragOver(e, "delete")}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, "delete")}
        >
          <p
            className={`font-medium ${
              dragOverZone === "delete" ? "text-red-600" : "text-gray-500"
            }`}
          >
            DELETE
          </p>
        </div>

        {/* Zona WON */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            dragOverZone === "won"
              ? "border-green-600 bg-green-100 scale-105"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => onDragOver(e, "won")}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, "won")}
        >
          <p
            className={`font-medium ${
              dragOverZone === "won" ? "text-green-600" : "text-gray-500"
            }`}
          >
            WON
          </p>
        </div>

        {/* Zona LOST */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            dragOverZone === "lost"
              ? "border-orange-600 bg-orange-100 scale-105"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => onDragOver(e, "lost")}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, "lost")}
        >
          <p
            className={`font-medium ${
              dragOverZone === "lost" ? "text-orange-600" : "text-gray-500"
            }`}
          >
            LOST
          </p>
        </div>

      </div>
    </div>
  );
}