// app/profile/page.tsx
import CustomHeader from "../../components/CustomHeader";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <CustomHeader title="Profile" />

      {/* Avatar Section */}
      <div className="text-center mt-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mx-auto">
          RS
        </div>
        <h2 className="text-xl font-bold mt-3">Rahul Sharma</h2>
        <p className="text-gray-600">Level 3 • Intermediate</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-indigo-500">45</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-indigo-500">1,250</div>
          <div className="text-sm text-gray-600">XP Points</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-indigo-500">12</div>
          <div className="text-sm text-gray-600">Lessons Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-indigo-500">85%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>
    </div>
  );
}
