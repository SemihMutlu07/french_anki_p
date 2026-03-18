"use client";

import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="md:ml-64 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
