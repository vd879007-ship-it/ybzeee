'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, Trash2, CheckCircle2, Upload, Loader2, Sparkles } from 'lucide-react';
import { FormImage } from './ProductForm';

interface SortableImageCardProps {
  image: FormImage;
  index: number;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export function SortableImageCard({
  image,
  index,
  onSetPrimary,
  onDelete,
  isOverlay = false,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  const isUploading = Boolean(image.uploading);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border transition-all select-none ${
        isOverlay
          ? 'shadow-2xl ring-2 ring-[var(--color-primary-gold)] scale-105 opacity-95 bg-white z-50 cursor-grabbing'
          : isDragging
          ? 'opacity-25 border-dashed border-2 border-[var(--color-primary-gold)] bg-amber-50/40 shadow-inner'
          : image.isPrimary
          ? 'border-[var(--color-primary-gold)] ring-2 ring-[var(--color-primary-gold)]/30 bg-white shadow-sm hover:shadow-md'
          : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:shadow-md'
      }`}
    >
      <div className="relative w-full h-full">
        {image.url ? (
          <Image
            src={image.url}
            alt={image.alt || `Product image ${index + 1}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-transform duration-300 ${
              !isDragging && !isOverlay ? 'group-hover:scale-105' : ''
            }`}
            unoptimized={image.url.startsWith('data:') || image.url.startsWith('blob:')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-sans">
            No Image
          </div>
        )}
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-30">
          <Loader2 className="animate-spin text-[var(--color-primary-gold)]" size={24} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Uploading...</span>
        </div>
      )}

      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs">
            #{index + 1}
          </span>
          {image.isPrimary && (
            <span className="inline-flex items-center gap-1 h-5 px-2 rounded-md bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[9px] font-bold uppercase tracking-wider shadow-xs">
              <Star size={10} className="fill-[var(--color-dark)]" />
              Primary
            </span>
          )}
        </div>

        {!isOverlay && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder image ${index + 1}`}
            className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-lg bg-black/65 backdrop-blur-xs text-white hover:bg-black hover:text-[var(--color-primary-gold)] cursor-grab active:cursor-grabbing transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-gold)] touch-none"
            title="Click and drag to reorder"
          >
            <GripVertical size={14} />
          </button>
        )}
      </div>

      {!isOverlay && !isDragging && (
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-1.5 z-20">
          {!image.isPrimary ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSetPrimary(image.id);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-[10px] font-bold transition-colors shadow-xs"
              title="Set as storefront primary image"
            >
              <Star size={11} className="text-[var(--color-primary-gold)]" />
              <span>Set Primary</span>
            </button>
          ) : (
            <div className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[10px] font-bold shadow-xs">
              <CheckCircle2 size={11} />
              <span>Main Cover</span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(image.id);
            }}
            className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-xs"
            title="Delete this image"
            aria-label="Delete image"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

interface ProductMediaSortableProps {
  images: FormImage[];
  onImagesChange: (newImages: FormImage[]) => void;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: (files: FileList) => void;
  uploadProgress: number | null;
}

export default function ProductMediaSortable({
  images,
  onImagesChange,
  onSetPrimary,
  onDelete,
  onUpload,
  uploadProgress,
}: ProductMediaSortableProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
          ...img,
          order: index,
          sortOrder: index + 1,
        }));
        onImagesChange(reordered);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverDropzone(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const activeImage = activeId ? images.find((i) => i.id === activeId) : null;
  const activeIndex = activeImage ? images.findIndex((i) => i.id === activeId) : -1;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOverDropzone(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOverDropzone(false);
        }}
        onDrop={handleDropzoneDrop}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 ${
          isDragOverDropzone
            ? 'border-[var(--color-primary-gold)] bg-amber-50/50 scale-[1.01]'
            : 'border-gray-200 hover:border-gray-400 bg-gray-50/50'
        }`}
      >
        <Upload className="mx-auto text-gray-400 mb-2" size={26} />
        <p className="text-xs font-bold text-gray-800">Upload Product Images</p>
        <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
          JPG, PNG, WEBP up to 5MB (Cloudinary supported)
        </p>

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          className="hidden"
          id="product-media-file-input"
        />
        <label
          htmlFor="product-media-file-input"
          className="mt-3 inline-block px-4 py-1.5 bg-[var(--color-dark)] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-black transition-colors shadow-xs"
        >
          Browse Files
        </label>
      </div>

      {uploadProgress !== null && (
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
          <div
            className="bg-[var(--color-primary-gold)] h-full transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {images.length > 1 && (
        <div className="flex items-center justify-between px-3 py-2 bg-amber-50/60 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 font-sans">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles size={13} className="text-[var(--color-primary-gold)] shrink-0" />
            <span>Drag cards or handles to rearrange image order for the storefront.</span>
          </span>
          <span className="text-[10px] font-bold text-amber-800/80 uppercase">
            {images.length} Images
          </span>
        </div>
      )}

      {images.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <SortableImageCard
                  key={img.id}
                  image={img}
                  index={idx}
                  onSetPrimary={onSetPrimary}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
            {activeImage && activeIndex !== -1 ? (
              <SortableImageCard
                image={activeImage}
                index={activeIndex}
                onSetPrimary={onSetPrimary}
                onDelete={onDelete}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-150 text-center text-xs text-gray-400 font-sans">
          No product images uploaded yet.
        </div>
      )}
    </div>
  );
}
