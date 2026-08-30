"use client";

import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortableHeaderProps<TData> = {
  column: Column<TData, unknown>;
  label: string;
};

export default function SortableHeader<TData>({
  column,
  label,
}: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(undefined, true)}
      className={cn(
        "px-2 transition-colors",
        sorted && "bg-primary/10 text-primary font-bold"
      )}
    >
      <span>{label}</span>

      {sorted && (
        <span className="ml-1 text-xs">
          {sorted === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Button>
  );
}