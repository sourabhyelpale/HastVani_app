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
      className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:scale-105 hover:shadow-lg transition"
    >
      <div className="text-3xl font-bold text-indigo-500 mb-2">{letter}</div>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto">
        {sign}
      </div>
    </div>
  );
}
