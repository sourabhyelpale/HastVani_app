// components/BottomTabNavigator.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomTabNavigator() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", icon: "🏠", href: "/" },
    { name: "Lessons", icon: "📚", href: "/lessons" },
    { name: "Alphabet", icon: "🔤", href: "/alphabet" },
    { name: "Practice", icon: "💪", href: "/practice" },
    { name: "Profile", icon: "👤", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white rounded-t-2xl shadow-md flex justify-around w-full max-w-md py-3">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          className={`flex flex-col items-center text-sm font-medium transition ${
            pathname === tab.href ? "text-indigo-500" : "text-gray-500"
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.name}
        </Link>
      ))}
    </div>
  );
}
