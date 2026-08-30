"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SideTab = {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  content: React.ReactNode;
};

type SideTabsLayoutProps = {
  tabs: SideTab[];
  defaultTab?: string;
};

export default function SideTabsLayout({
  tabs,
  defaultTab,
}: SideTabsLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:cursor-pointer",
                active
                  ? "bg-muted text-foreground"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-none">
                  {tab.title}
                </p>

                {tab.description && (
                  <p className="mt-1 truncate text-xs">
                    {tab.description}
                  </p>
                )}
              </div>

              {active && <ChevronRight className="size-4 shrink-0" />}
            </button>
          );
        })}
      </aside>

      <section className="min-w-0">{activeContent}</section>
    </div>
  );
}