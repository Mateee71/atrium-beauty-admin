"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CalendarSync,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import EditAppointment from "@/components/EditAppointment";
import { cn } from "@/lib/utils";
import CreateAppointmentDialog from "@/components/appointments/CreateAppointmentDialog";
import SortableHeader from "@/components/table/SortableHeader";
import ActiveSortingBadges from "@/components/table/ActiveSortingBadges";
import ColumnVisibilityDropdown from "@/components/table/ColumnVisibilityDropdown";

export type CustomersAppointments = {
  id: string;
  date: string;
  time: string;
  status: string;
  updatedAt: string;
  stylist: { id: string | null; name: string | null } | null;
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  services: { name: string; category: { name: string } }[];
};

const columnLabels: Record<string, string> = {
  index: "# Számozás",
  name: "Név",
  email: "Email",
  phone: "Telefon",
  date: "Dátum",
  time: "Óra",
  service_category: "Kategória",
  service: "Szolgáltatás",
  stylist: "Stylist",
  lastModified: "Módosítva/Létrehozva",
  actions: "Műveletek",
};

function AppointmentActions({
  appointment,
  users,
  categories,
}: {
  appointment: CustomersAppointments;
  users: any[];
  categories: any[];
}) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const cleanupBodyPointerEvents = () => {
    setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 50);
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/deleteAppointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appointment.id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Időpont törölve!");
        router.refresh();
      } else {
        toast.error(data.error || "Hiba történt a törlés során.");
      }
    } catch {
      toast.error("Nem sikerült törölni az időpontot.");
    }

    setLoading(false);
    setOpenConfirm(false);
    cleanupBodyPointerEvents();
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Menü megnyitása</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setMenuOpen(false);

              setTimeout(() => {
                setIsOpen(true);
              }, 100);
            }}
          >
            <CalendarSync /> Szerkesztés
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            className=" cursor-pointer"
            onSelect={() => {
              setMenuOpen(false);

              setTimeout(() => {
                setOpenConfirm(true);
              }, 100);
            }}
          >
            <Trash2 />
            Időpont törlése
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            cleanupBodyPointerEvents();
          }
        }}
      >
        <SheetContent>
          <SheetTitle>Időpont szerkesztése</SheetTitle>

          <EditAppointment
            users={users}
            appointment={appointment}
            categories={categories}
            onClose={() => {
              setIsOpen(false);
              cleanupBodyPointerEvents();
            }}
          />
        </SheetContent>
      </Sheet>

      <Dialog
        open={openConfirm}
        onOpenChange={(open) => {
          setOpenConfirm(open);

          if (!open) {
            cleanupBodyPointerEvents();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biztosan törölni szeretnéd?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Ez a művelet nem vonható vissza.
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="ghost"
                disabled={loading}
                onClick={() => {
                  setOpenConfirm(false);
                  cleanupBodyPointerEvents();
                }}
              >
                Mégsem
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const getColumns = (
  categories: any[],
  users: any[]
): ColumnDef<CustomersAppointments>[] => [
  {
    id: "index",
    header: "#",
    cell: ({ table, row }) => table.getFilteredRowModel().rows.length - row.index,
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "name",
    accessorFn: (row) => row.customer?.name ?? "",
    header: ({ column }) => <SortableHeader column={column} label="Név" />,
    cell: ({ row }) => <span>{row.original.customer?.name ?? "N/A"}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "email",
    accessorFn: (row) => row.customer?.email ?? "",
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
    cell: ({ row }) => <span>{row.original.customer?.email ?? "N/A"}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "phone",
    accessorFn: (row) => row.customer?.phone ?? "",
    header: ({ column }) => <SortableHeader column={column} label="Telefon" />,
    cell: ({ row }) => row.original.customer?.phone || "N/A",
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "date",
    accessorFn: (row) => new Date(row.date).getTime(),
    header: ({ column }) => <SortableHeader column={column} label="Dátum" />,
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return <span>{date.toLocaleDateString()}</span>;
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "basic",
  },
  {
    id: "time",
    accessorFn: (row) => new Date(row.date).getTime(),
    header: ({ column }) => <SortableHeader column={column} label="Óra" />,
    cell: ({ row }) => {
      const date = new Date(row.original.date);

      return (
        <span>
          {date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "basic",
  },
  {
    id: "service_category",
    accessorFn: (row) => {
      if (!row.services || row.services.length === 0) return "";

      return Array.from(
        new Set(row.services.map((service) => service.category.name))
      ).join(", ");
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Kategória" />
    ),
    cell: ({ row }) => {
      if (!row.original.services || row.original.services.length === 0) {
        return "N/A";
      }

      return Array.from(
        new Set(row.original.services.map((service) => service.category.name))
      ).join(", ");
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "service",
    accessorFn: (row) => {
      if (!row.services || row.services.length === 0) return "";

      return row.services.map((service) => service.name).join(", ");
    },
    header: ({ column }) => (
      <SortableHeader column={column} label="Szolgáltatás" />
    ),
    cell: ({ row }) => {
      if (!row.original.services || row.original.services.length === 0) {
        return "N/A";
      }

      return row.original.services.map((service) => service.name).join(", ");
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "stylist",
    accessorFn: (row) => row.stylist?.name ?? "",
    header: ({ column }) => <SortableHeader column={column} label="Stylist" />,
    cell: ({ row }) => {
      const stylist = row.original.stylist;

      if (!stylist) return "-";

      return (
        <a
          href={"/dashboard/users/" + stylist.id}
          className="font-medium underline"
        >
          {stylist.name}
        </a>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "lastModified",
    accessorFn: (row) => new Date(row.updatedAt).getTime(),
    header: ({ column }) => (
      <SortableHeader column={column} label="Módosítva/Létrehozva" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);

      return (
        <span>
          {date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: "basic",
  },
  {
    id: "actions",
    header: "Műveletek",
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => (
      <AppointmentActions
        appointment={row.original}
        users={users}
        categories={categories}
      />
    ),
  },
];

export default function Appointments({
  users,
  appointments,
  categories,
}: {
  users: any[];
  appointments: CustomersAppointments[];
  categories: any[];
}) {

  const router = useRouter();

  const [tableAppointments, setTableAppointments] =
    React.useState<CustomersAppointments[]>(appointments);

  React.useEffect(() => {
    setTableAppointments(appointments);
  }, [appointments]);


  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = React.useMemo(
    () => getColumns(categories, users),
    [categories, users]
  );

  const table = useReactTable({
    data: tableAppointments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    enableMultiSort: true,
    isMultiSortEvent: () => true,
    maxMultiSortColCount: 5,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <DynamicBreadcrumb />

      <h1 className="text-xl font-semibold mt-4 mb-6">Időpontok</h1>

      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Keresés név alapján..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            const value = event.target.value || undefined;
            table.getColumn("name")?.setFilterValue(value);
          }}
          className="max-w-sm"
        />

        <CreateAppointmentDialog
          users={users}
          categories={categories}
          trigger={
            <Button variant="default" className="ml-2">
              Új időpont hozzáadása
            </Button>
          }
          onCreated={(appointment) => {
            setTableAppointments((prev) => [appointment, ...prev]);
            router.refresh();
          }}
        />

        <ActiveSortingBadges sorting={sorting} columnLabels={columnLabels} />

        <ColumnVisibilityDropdown table={table} columnLabels={columnLabels} />
      </div>

      <div className="overflow-hidden rounded-md border bg-sidebar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                     className="h-14"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nincs találat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Előző
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Következő
          </Button>
        </div>
      </div>
    </div>
  );
}