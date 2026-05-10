"use client";

import { Pin } from "lucide-react";

import type { NoteEntry } from "@/features/traveloop";

import { cn } from "./utils";

export interface NoteJournalTimelineProps {
  notes: NoteEntry[];
  onOpen?: (note: NoteEntry) => void;
  className?: string;
}

export function NoteJournalTimeline({ notes, onOpen, className }: NoteJournalTimelineProps) {
  return (
    <ol className={cn("space-y-3", className)} aria-label="Travel journal">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <button type="button" onClick={() => onOpen?.(note)} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(note.createdAt))}
                </p>
                {note.title ? <h3 className="mt-1 text-lg font-semibold text-slate-950">{note.title}</h3> : null}
              </div>
              {note.pinned ? <Pin aria-label="Pinned note" className="h-4 w-4 text-blue-600" /> : null}
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{note.body}</p>
            {note.mood ? <span className="mt-3 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium capitalize text-emerald-700">{note.mood}</span> : null}
          </button>
        </li>
      ))}
    </ol>
  );
}
