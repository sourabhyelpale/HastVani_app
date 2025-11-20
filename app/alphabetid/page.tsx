// app/alphabet/[letter]/page.tsx
"use client";
import { useParams } from "next/navigation";
import CustomHeader from "../../components/CustomHeader";
import { alphabetData } from "../../constants/data";

export default function AlphabetDetailPage() {
  const params = useParams();
  const letter = params.letter as string;
  const sign = alphabetData.find((a) => a.letter === letter)?.sign || "❓";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CustomHeader title={`Letter ${letter}`} />

      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Letter {letter} Sign</h2>
        <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-5xl text-indigo-500 mx-auto mb-4">
          {sign}
        </div>
        <p className="text-gray-700 mb-4">Practice the ISL hand sign for "{letter}".</p>

        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
            📹 Watch Video
          </button>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
            💪 Practice
          </button>
        </div>
      </div>
    </div>
  );
}
