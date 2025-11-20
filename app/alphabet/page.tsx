// app/alphabet/page.tsx
import CustomHeader from "../../components/CustomHeader";
import AlphabetCard from "../../components/AlphabetCard";
import { alphabetData } from "../../constants/data";

export default function AlphabetPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CustomHeader title="ISL Alphabet" />

      <div className="grid grid-cols-3 gap-4 mt-6">
        {alphabetData.map((alpha) => (
          <AlphabetCard key={alpha.letter} letter={alpha.letter} sign={alpha.sign} />
        ))}
      </div>
    </div>
  );
}
