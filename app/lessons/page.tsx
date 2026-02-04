// app/lessons/page.tsx
import CustomHeader from "../../components/CustomHeader";
import LessonCard from "../../components/LessonCard";
import { lessonsData } from "../../constants/data";

export default function LessonsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CustomHeader title="Lessons" />

      <div className="mt-6">
        {lessonsData.map((lesson) => (
          <LessonCard
            key={lesson.id}
            icon={lesson.icon}
            title={lesson.title}
            subtitle={lesson.subtitle}
            progress={lesson.progress}
            link={`/lessons/${lesson.id}`}
          />
        ))}
      </div>
    </div>
  );
}
