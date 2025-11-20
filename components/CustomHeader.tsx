// components/CustomHeader.tsx
"use client";
import React from "react";

interface CustomHeaderProps {
  title: string;
  showIcons?: boolean;
}

export default function CustomHeader({ title, showIcons = true }: CustomHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-lg shadow">
      <h1 className="text-xl font-bold">{title}</h1>
      {showIcons && (
        <div className="flex gap-3">
          <button className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30">🔔</button>
          <button className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30">⚙️</button>
        </div>
      )}
    </div>
  );
}
