"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  BadgeCheckIcon,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  TriangleAlert,
  User,
  UserIcon,
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
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { handleSignUp } from "@/app/actions/signup";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { NO_USER_IMAGE } from "@/config";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import SortableHeader from "@/components/table/SortableHeader";
import ActiveSortingBadges from "@/components/table/ActiveSortingBadges";
import ColumnVisibilityDropdown from "@/components/table/ColumnVisibilityDropdown";

export type UserWithAccounts = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  accounts: { provider: string }[];
  profile: {
    phone: string | null;
  } | null;
  role: {
    name: string | null;
    longName: string | null;
    icon: string | null;
  } | null;
};

 function capitalizeFirstLetter(str: any) {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

const columnLabels: Record<string, string> = {
  image: "Kép",
  name: "Név",
  email: "Email",
  phone: "Telefon",
  role: "Szerep",
  accountType: "Fiók típusa",
  actions: "Műveletek",
};

export const columns: ColumnDef<UserWithAccounts>[] = [
  /* {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }, */
  {
    accessorKey: "image",
    header: "Kép",
    cell: ({ row }) => (
      <Image
        src={row.original.image || NO_USER_IMAGE}
        alt={row.original.name || "N/A"}
        width={40}
        height={40}
        sizes="40px"
        className="rounded-full object-cover"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column} label="Név" />
    ),
    cell: ({ row }) => <a href={"/dashboard/users/"+row.original.id} className="font-medium underline">{row.original.name}</a>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column} label="Email" />
    ),
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    id: "phone",
    header: ({ column }) => (
      <SortableHeader column={column} label="Telefon" />
    ),
    cell: ({ row }) => row.original.profile?.phone || "N/A",
    accessorFn: (row) => row.profile?.phone || "",
  },
  {
    id: "role",
    header: ({ column }) => (
      <SortableHeader column={column} label="Szerep" />
    ),
    cell: ({ row }) => {
      const roleName = row.original.role?.name || "";
      const roleLabel = row.original.role?.longName || row.original.role?.name || "Nincs";

      if (roleName === "ADMIN") {
        return (
          <Badge variant="outline">
            {capitalizeFirstLetter(roleLabel)}
          </Badge>
        );
      }

      return capitalizeFirstLetter(roleLabel);
    },
    accessorFn: (row) => row.role?.longName || row.role?.name || "",
  },
  {
    id: "accountType",
    header: ({ column }) => (
      <SortableHeader column={column} label="Fiók típusa" />
    ),
    cell: ({ row }) => {
      const provider = capitalizeFirstLetter(row.original.accounts?.[0]?.provider);
      return (
        <Badge
          variant={provider ? "secondary" : "outline"}
          className={provider === "Google" ? "bg-blue-500 text-white dark:bg-blue-600" : ""}
        >
          {provider === "Google" && <BadgeCheckIcon className="w-4 h-4" />}
          {provider || "Credentials"}
        </Badge>
      );
    },
    accessorFn: (row) => row.accounts?.[0]?.provider || "Credentials",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter();
      const [openConfirm, setOpenConfirm] = React.useState(false);
      const [loading, setLoading] = React.useState(false);

      const handleDelete = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/deleteUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id }),
          });
          const data = await res.json();

          if (data.success) {
            toast.success("Felhasználó törölve!");
            router.refresh();
          } else {
            toast.error(data.error || "Hiba történt a törlés során.");
          }
        } catch {
          toast.error("Nem sikerült törölni a felhasználót.");
        }
        setLoading(false);
        setOpenConfirm(false);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Műveletek</DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.id}`)} className="cursor-pointer">
                  <User /> Profil megtekintése
                </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer"
              variant="destructive"
                                onClick={() => setOpenConfirm(true)}
              >
                <Trash2/> Profil törlése
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Biztosan törölni szeretnéd?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Ez a művelet nem vonható vissza. A felhasználó adatai véglegesen törlődnek.
              </p>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" disabled={loading}>
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
    },
  },
];

export default function UsersPageClient({ users, roles }: { users: UserWithAccounts[]; roles: any[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const res = await handleSignUp(formData);
    setLoading(false);
    if (res.success) {
      toast.success("Sikeres regisztráció!");
      setRegisterOpen(false);
    } else {
      setError(res.error || "Hiba történt a regisztráció során.");
    }
  }

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
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
      <h1 className="text-xl font-semibold mt-4 mb-6">Alkalmazottak</h1>
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Keresés név alapján..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="ml-2"
              onClick={() => setRegisterOpen(true)}
            >
              Új felhasználó regisztrálása
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-s">
            <DialogHeader>
              <DialogTitle className="mb-4">Új felhasználó regisztrálása</DialogTitle>
              {!!error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mt-2">
                  <TriangleAlert />
                  <p>{error}</p>
                </div>
              )}
            </DialogHeader>
            <form
              className="grid gap-4"
              action={onSubmit}
            >
              <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="mb-2">Név</Label>
                  </div>
                <div className="relative">
                  <UserIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Kiss Péter"
                    disabled={loading}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="mb-2">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="pelda@email.com"
                    disabled={loading}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="role" className="mb-2">Phone</Label>
                  <span className="rounded-[5px] bg-gray-200 text-gray-500 p-[5px] pt-[3px] pb-[3px] text-right text-[0.6rem] font-medium mb-2">Optional</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="phone"
                    name="phone"
                    placeholder="+36301234567"
                    disabled={loading}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-2">
                  Jelszó
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    disabled={loading}
                    className="pl-8 pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 karakter, legalább egy szám és egy betű.
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="mb-2">
                  Jelszó újra
                </Label>
                <div className="relative">
                  <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    disabled={loading}
                    className="pl-8 pr-8"
                    required
                  />
                </div>
              </div>


              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="role" className="mb-2">Szerep</Label>
                  <span className="rounded-[5px] bg-gray-200 text-gray-500 p-[5px] pt-[3px] pb-[3px] text-right text-[0.6rem] font-medium mb-2">Optional</span>
                </div>
                <Select
                  name="role"
                  onValueChange={(value) => setRole(value || null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Válassz szerepet" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                          {role.longName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className=" mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={loading}>
                    Mégsem
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Regisztrálás
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
