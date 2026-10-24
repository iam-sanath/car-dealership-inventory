import { useState } from "react";
import { Header, type View } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import AuthPage from "@/pages/AuthPage";
import Inventory from "@/pages/Inventory";
import Manage from "@/pages/Manage";

export default function App() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("inventory");

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header view={view} onViewChange={setView} />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8">
        {view === "manage" && user.role === "ADMIN" ? <Manage /> : <Inventory />}
      </main>
    </div>
  );
}