"use client";

import type { SortingState } from "@tanstack/react-table";

type ActiveSortingBadgesProps = {
  sorting: SortingState;
  columnLabels: Record<string, string>;
};

export default function ActiveSortingBadges({
  sorting,
  columnLabels,
}: ActiveSortingBadgesProps) {
  if (sorting.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span className="flex items-center font-medium text-foreground">
        Aktív rendezések:
      </span>

      {sorting.map((sortItem, index) => (
        <span
          key={sortItem.id}
          className="flex items-center rounded-md bg-primary/10 px-2 py-1 text-primary font-medium"
        >
          {index + 1}. {columnLabels[sortItem.id] ?? sortItem.id}{" "}
          {sortItem.desc ? "↓" : "↑"}
        </span>
      ))}
    </div>
  );
}