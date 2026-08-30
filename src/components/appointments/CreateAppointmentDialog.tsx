"use client";

import { useMemo, useState } from "react";
import { Loader2, Mail, Phone, TriangleAlert, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateTimePicker24h } from "@/components/ui/DateTimePicker24h";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  users: any[];
  categories: any[];
  trigger: React.ReactNode;
  defaultDate?: Date;
  defaultStylistId?: string;
  onCreated?: (appointment: any) => void;
};

export default function CreateAppointmentDialog({
  users,
  categories,
  trigger,
  defaultDate,
  defaultStylistId = "",
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stylistId, setStylistId] = useState(defaultStylistId);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [dateTime, setDateTime] = useState<Date | null>(defaultDate ?? null);

  const selectedStylist = users.find((user) => user.id === stylistId);

  const availableServices = useMemo(() => {
    if (!selectedStylist) return [];

    return categories
      .filter((category: any) => category.roleId === selectedStylist.role?.id)
      .flatMap((category: any) =>
        category.services.map((service: any) => ({
          ...service,
          categoryId: category.id,
          categoryName: category.name,
        }))
      );
  }, [categories, selectedStylist]);

  const selectedService = availableServices.find(
    (service: any) => service.id === selectedServiceId
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dateTime: dateTime ? dateTime.toISOString() : "",
      stylist_id: stylistId,
      service_category_id: selectedService?.categoryId || "",
      service_ids: selectedServiceId ? [selectedServiceId] : [],
    };

    if (!payload.name || !payload.email || !payload.dateTime) {
      setError("Kérlek, töltsd ki az összes kötelező mezőt!");
      setLoading(false);
      return;
    }

    if (payload.name.length < 3 || payload.name.length > 50) {
      setError("A névnek 3 és 50 karakter között kell lennie!");
      setLoading(false);
      return;
    }

    if (!payload.stylist_id) {
      setError("Kérlek, válassz stylistot!");
      setLoading(false);
      return;
    }

    if (!payload.service_ids.length) {
      setError("Kérlek, válassz szolgáltatást!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/createAppointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Hiba történt az időpont létrehozásakor.");
        return;
      }

      toast.success("Időpont sikeresen létrehozva!");
      onCreated?.(data.data);

      setOpen(false);
      setStylistId(defaultStylistId);
      setSelectedServiceId("");
      setDateTime(defaultDate ?? null);
      e.currentTarget.reset();
    } catch {
      setError("Hálózati hiba történt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-s">
        <DialogHeader>
          <DialogTitle className="mb-4">Új időpont létrehozása</DialogTitle>

          {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mt-2">
              <TriangleAlert />
              <p>{error}</p>
            </div>
          )}
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name" className="mb-2">Ügyfél neve</Label>
            <div className="relative">
              <UserIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" name="name" placeholder="Kiss Péter" disabled={loading} className="pl-8" required />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" name="email" placeholder="pelda@email.com" disabled={loading} className="pl-8" required />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="phone" className="mb-2">Telefon</Label>
              <span className="rounded-[5px] bg-gray-200 text-gray-500 p-[5px] pt-[3px] pb-[3px] text-right text-[0.6rem] font-medium mb-2">
                Optional
              </span>
            </div>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="phone" name="phone" placeholder="+36301234567" disabled={loading} className="pl-8" />
            </div>
          </div>

          <div>
            <Label htmlFor="dateTime" className="mb-2">Időpont kiválasztása</Label>
            <DateTimePicker24h selected={dateTime ?? undefined} onSelect={(d: Date) => setDateTime(d)} />
          </div>

          <div>
            <Label htmlFor="stylist" className="mb-2">Stylist</Label>
            <Select value={stylistId} onValueChange={(value) => {
              setStylistId(value);
              setSelectedServiceId("");
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Válassz stylistot" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-xxs">{user.name?.[0] ?? "?"}</AvatarFallback>
                      </Avatar>
                      <p className="truncate">{user.name}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service" className="mb-2">Szolgáltatás</Label>
            <Select value={selectedServiceId} disabled={!stylistId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={stylistId ? "Válassz szolgáltatást" : "Először válassz stylistot"} />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map((service: any) => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={loading}>Mégsem</Button>
            </DialogClose>

            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Létrehozás
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}