import React from 'react';
import { Brain } from 'lucide-react';

export default function Loading({ text = 'Querying Hindsight Memory Bank...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
          <Brain className="w-6 h-6 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-600 tracking-wide">
        {text}
      </p>
    </div>
  );
}
