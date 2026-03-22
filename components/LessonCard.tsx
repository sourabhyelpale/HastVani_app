// components/LessonCard.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface LessonCardProps {
  icon: string;
  title: string;
  subtitle: string;
  progress: number;
  link?: string;
}

export default function LessonCard({ icon, title, subtitle, progress, link }: LessonCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => link && router.push(link)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4 border-l-4 border-primary-500 cursor-pointer hover:translate-x-1 hover:shadow-lg transition-all"
    >
      <h3 className="text-lg font-semibold mb-1 dark:text-gray-100">
        {icon} {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mt-3">
        <div
          className="h-2 rounded bg-gradient-to-r from-primary-500 to-primary-600 transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
