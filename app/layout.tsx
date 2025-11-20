// app/layout.tsx
import "../styles/globals.css";
import BottomTabNavigator from "../components/BottomTabNavigator";

export const metadata = {
  title: "ISL Learning App",
  description: "Learn Indian Sign Language interactively",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <BottomTabNavigator />
      </body>
    </html>
  );
}
