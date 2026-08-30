"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Mail, Phone, StickyNote, User, Loader2, Trash2 } from "lucide-react";
import { hu } from "date-fns/locale";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import EditAppointment from "@/components/EditAppointment";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  const { users, categories, setLocalEvents } = useCalendar();
  const router = useRouter();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/deleteAppointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Nem sikerült törölni az időpontot.");
      }

      setLocalEvents((prev) => prev.filter((item) => item.id !== event.id));

      toast.success("Időpont törölve!");
      setDeleteOpen(false);
      setDetailsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Hiba történt a törlés során.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const appointmentForEdit = {
    id: event.id,
    date: event.startDate,
    status: event.status,
    note: event.note,
    customer: event.customer,
    stylist: event.user,
    services: event.serviceIds.map((id) => ({ id })),
  };

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Foglaló neve</p>
                <p className="text-sm text-muted-foreground">{event.customer.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Telefonszám</p>
                <p className="text-sm text-muted-foreground">
                  {event.customer.phone || "Nincs megadva"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Email cím</p>
                <p className="text-sm text-muted-foreground">{event.customer.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Szakember</p>
                <p className="text-sm text-muted-foreground">{event.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Kezdés</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "yyyy. MMMM d. HH:mm", { locale: hu })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Vége</p>
                <p className="text-sm text-muted-foreground">
                  {format(endDate, "yyyy. MMMM d. HH:mm", { locale: hu })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <StickyNote className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Megjegyzés</p>
                <p className="text-sm text-muted-foreground">
                  {event.note || "Nincs megjegyzés"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setDetailsOpen(false);
                setEditOpen(true);
              }}
            >
              Szerkesztés
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteOpen(true)}
              className="border-red-500 text-red-500 hover:bg-red-600 hover:text-red-50 focus:ring-red-500"
            >
              <Trash2 className="size-4" />
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <EditAppointment
          users={users}
          categories={categories}
          appointment={appointmentForEdit}
          onClose={() => setEditOpen(false)}
        />
      </Sheet>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Időpont törlése</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Biztosan törölni szeretnéd ezt az időpontot? A vendég email értesítést fog kapni a törlésről.
          </p>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={deleteLoading}>
                Mégsem
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              {deleteLoading && <Loader2 className="size-4 animate-spin" />}
              Törlés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
