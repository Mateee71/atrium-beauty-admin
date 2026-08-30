"use client";

import React, { useState, useEffect } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

import { appointmentSchema, appointmentUpdateSchema } from "@/lib/schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/label";
import { DateTimePicker24h } from "@/components/ui/DateTimePicker24h";

interface EditAppointmentProps {
  users: any[];
  appointment: any;
  categories: any[];
  onClose?: () => void;
}

const editAppointmentFormSchema = appointmentSchema.pick({
  name: true,
  email: true,
  phone: true,
  status: true,
  note: true,
});

const EditAppointment = ({
  users,
  appointment,
  categories,
  onClose,
}: EditAppointmentProps) => {
  const [selectedServiceId, setSelectedServiceId] = useState(
    appointment.services?.[0]?.id || "",
  );
  const [dateTime, setDateTime] = useState<Date | null>(() =>
    appointment.date ? new Date(appointment.date) : null,
  );
  const [stylistId, setStylistId] = useState(appointment.stylist?.id || "");

  const selectedStylist = users.find((user) => user.id === stylistId);

  const availableServices = selectedStylist
    ? categories
        .filter((category) => category.roleId === selectedStylist.role?.id)
        .flatMap((category) =>
          category.services.map((service: any) => ({
            ...service,
            categoryId: category.id,
            categoryName: category.name,
          })),
        )
    : [];

  const selectedService = availableServices.find(
    (service: any) => service.id === selectedServiceId,
  );

  const form = useForm<z.input<typeof editAppointmentFormSchema>>({
    resolver: zodResolver(editAppointmentFormSchema),
    defaultValues: {
      name: appointment.customer.name,
      email: appointment.customer.email,
      phone: appointment.customer.phone || "",
      status: (appointment.status || "pending").toLowerCase(),
      note: appointment.note || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: appointment.customer.name,
      email: appointment.customer.email,
      phone: appointment.customer.phone || "",
      status: (appointment.status || "pending").toLowerCase(),
      note: appointment.note || "",
    });

    setStylistId(appointment.stylist?.id || "");

    if (appointment.services?.length > 0) {
      setSelectedServiceId(appointment.services?.[0]?.id || "");
    }

    setDateTime(appointment.date ? new Date(appointment.date) : null);
  }, [appointment, form]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const onSubmit = async (data: z.input<typeof editAppointmentFormSchema>) => {
    if (!dateTime) {
      toast.error("Válassz időpontot!");
      return;
    }

    if (!stylistId) {
      toast.error("Válassz stylistot!");
      return;
    }

    if (!selectedServiceId || !selectedService) {
      toast.error("Válassz szolgáltatást!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: appointment.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || "pending",
        dateTime: dateTime ? dateTime.toISOString() : "",
        stylist_id: stylistId,
        service_category_id: selectedService.categoryId || "",
        service_ids: [selectedServiceId],
        note: data.note || "",
      };

      const res = await fetch("/api/updateAppointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Fetch status:", res.status);
      const result = await res.json();
      console.log("Result:", result);

      if (!result.success) throw new Error(result.error);

      toast.success("Időpont frissítve!");
      await update();
      router.refresh();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(err.message || "Frissítés sikertelen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SheetContent className="overflow-y-auto min-w-[410px]">
      <SheetHeader>
        <SheetTitle>Időpont szerkesztése</SheetTitle>
        <SheetDescription className="mb-4">
          Ügyfél adatainak szerkesztése, időpont módosítása.
        </SheetDescription>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              form.handleSubmit(
                (data) => {
                  console.log("VALID DATA:", data);
                  onSubmit(data);
                },
                (errors) => {
                  console.error("VALIDATION ERRORS:", errors);
                },
              )(e);
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Név</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    Formátum: +36 20 123 4567
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="mb-2">Időpont kiválasztása</Label>
              <DateTimePicker24h
                selected={dateTime ?? undefined}
                onSelect={setDateTime}
              />

              <input
                type="hidden"
                name="dateTime"
                value={dateTime ? dateTime.toISOString() : ""}
              />
            </div>
            <div>
              <Label className="mb-2">Stylist</Label>
              <Select
                value={stylistId}
                onValueChange={(value) => {
                  setStylistId(value);
                  setSelectedServiceId("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Válassz stylistet" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2">Szolgáltatás</Label>

              <Select
                value={selectedServiceId}
                disabled={!stylistId}
                onValueChange={setSelectedServiceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      stylistId
                        ? "Válassz szolgáltatást"
                        : "Először válassz stylistet"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {availableServices.map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Állapot</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={appointment.status || "Unasigned"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Foglalt</SelectItem>
                        <SelectItem value="done">Teljesítve</SelectItem>
                        <SelectItem value="resigned">Lemondva</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Válassza ki az időpont állapotát.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Mentés..." : "Mentés"}
            </Button>
          </form>
        </Form>
      </SheetHeader>
    </SheetContent>
  );
};

export default EditAppointment;
