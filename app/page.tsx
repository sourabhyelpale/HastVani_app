// app/page.tsx
import CustomHeader from "../components/CustomHeader";
import LessonCard from "../components/LessonCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Top Navbar */}
      <CustomHeader title="ISL Learn" showIcons />

      {/* Welcome Section */}
      <div className="text-center mt-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
        <p className="text-gray-600">Continue your ISL journey</p>
      </div>

      {/* Lesson Cards */}
      <LessonCard
        icon="📚"
        title="Today's Lesson"
        subtitle="Basic Greetings - Level 1"
        progress={75}
        link="/lessons"
      />

      <LessonCard
        icon="🔤"
        title="Alphabet Practice"
        subtitle="Master ISL alphabet signs"
        progress={45}
        link="/alphabet"
      />

      <LessonCard
        icon="💪"
        title="Daily Practice"
        subtitle="Review and strengthen skills"
        progress={60}
        link="/practice"
      />
    </div>
  );
}
