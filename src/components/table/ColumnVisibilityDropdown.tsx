"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ColumnVisibilityDropdownProps<TData> = {
  table: Table<TData>;
  columnLabels: Record<string, string>;
};

export default function ColumnVisibilityDropdown<TData>({
  table,
  columnLabels,
}: ColumnVisibilityDropdownProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Oszlopok <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="cursor-pointer"
              checked={column.getIsVisible()}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnLabels[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}