// components/AlphabetCard.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface AlphabetCardProps {
  letter: string;
  sign: string;
}

export default function AlphabetCard({ letter, sign }: AlphabetCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/alphabet/${letter}`)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center cursor-pointer hover:scale-105 hover:shadow-lg transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
    >
      <div className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mb-2">{letter}</div>
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl mx-auto">
        {sign}
      </div>
    </div>
  );
}
