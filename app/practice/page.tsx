// app/practice/page.tsx
"use client";
import React, { useState } from "react";
import CustomHeader from "../../components/CustomHeader";

export default function PracticePage() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    setSelected(answer);
    setTimeout(() => {
      alert(`You chose: ${answer}. Moving to next question...`);
      setSelected(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CustomHeader title="Practice" />

      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">What does this sign mean?</h3>

        {/* Sign display */}
        <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-5xl text-indigo-500 mx-auto mb-6">
          👋
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {["Hello", "Goodbye", "Thank You", "Please"].map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`px-4 py-2 rounded-lg border-2 transition ${
                selected === opt
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-indigo-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question 3 of 10</span>
          <span>❤️❤️❤️</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div className="h-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: "30%" }}></div>
        </div>
      </div>
    </div>
  );
}
