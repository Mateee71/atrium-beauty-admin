"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOGO_BLACK, ADDRESS } from "@/config";
import Image from "next/image";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  category: {
    id: string;
    name: string;
    roleId: string | null;
    role: {
      id: string;
      name: string;
      longName: string | null;
    } | null;
  };
};

type Stylist = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: {
    id: string;
    name: string;
    longName: string | null;
  };
  profile: {
    phone: string | null;
    bio: string | null;
  } | null;
};

type Step = "select" | "calendar" | "details" | "success";

type CustomerForm = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  note: string;
};

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

const monthNames = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
];

const dayNames = ["V", "H", "K", "SZE", "CS", "P", "SZO"];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return getDateKey(a) === getDateKey(b);
}

function getCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Array<Date | null> = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("hu-HU", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTimeWithPeriod(time?: string) {
  if (!time) return "";
  const hour = parseInt(time.split(":")[0], 10);
  const prefix = hour < 12 ? "de." : "du.";
  return `${prefix} ${time}`;
}

export default function BookingEmbed() {
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);

  const [selectedStylistId, setSelectedStylistId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStylists, setLoadingStylists] = useState(true);

  const [servicesError, setServicesError] = useState("");
  const [stylistsError, setStylistsError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [submittingAppointment, setSubmittingAppointment] = useState(false);

  const [step, setStep] = useState<Step>("select");

  const [availableTimesByDate, setAvailableTimesByDate] = useState<Record<string, string[]>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (!selectedStylistId) {
      setAvailableTimesByDate({});
      return;
    }

    let cancelled = false;

    async function loadMonthAvailability() {
      setLoadingAvailability(true);

      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        const res = await fetch(
          `/api/public/availability/month?stylistId=${selectedStylistId}&year=${year}&month=${month}`
        );

        if (!res.ok) {
          throw new Error("Nem sikerült lekérni az elérhető időpontokat.");
        }

        const data = await res.json();

        if (!cancelled) {
          setAvailableTimesByDate(data.days || {});
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setAvailableTimesByDate({});
        }
      } finally {
        if (!cancelled) {
          setLoadingAvailability(false);
        }
      }
    }

    loadMonthAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedStylistId, currentMonth]);

  useEffect(() => {
    window.parent?.postMessage(
        {
            type: "ATRIUM_BOOKING_STEP",
            step,
        },
        "*"
    );
  }, [step]);

  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/public/services");

        if (!res.ok) {
          throw new Error("Nem sikerült betölteni a szolgáltatásokat.");
        }

        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error(error);
        setServicesError("Nem sikerült betölteni a szolgáltatásokat.");
      } finally {
        setLoadingServices(false);
      }
    }

    async function loadStylists() {
      try {
        const res = await fetch("/api/public/stylists");

        if (!res.ok) {
          throw new Error("Nem sikerült betölteni a szakembereket.");
        }

        const data = await res.json();
        setStylists(data);
      } catch (error) {
        console.error(error);
        setStylistsError("Nem sikerült betölteni a szakembereket.");
      } finally {
        setLoadingStylists(false);
      }
    }

    loadServices();
    loadStylists();
  }, []);

  const selectedStylist = stylists.find(
    (stylist) => stylist.id === selectedStylistId
  );

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );

  const filteredServices = selectedStylist
    ? services.filter((service) => {
        return service.category.roleId === selectedStylist.role.id;
      })
    : [];

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const todayMonth = new Date();
  const isCurrentMonth =
    currentMonth.getFullYear() === todayMonth.getFullYear() &&
    currentMonth.getMonth() === todayMonth.getMonth();

  const canGoToCalendar = Boolean(selectedStylist && selectedService);

  const canSubmitDetails =
    customerForm.lastName.trim() &&
    customerForm.firstName.trim() &&
    customerForm.email.trim() &&
    customerForm.phone.trim() &&
    selectedDate &&
    selectedTime;
  
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : "";
  const availableTimes = selectedDateKey
    ? availableTimesByDate[selectedDateKey] || []
    : [];

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime("");
  }

  function handleSelectTime(time: string) {
    if (!availableTimes.includes(time)) {
      return;
    }

    setSelectedTime(time);
    setStep("details");
  }

  async function handleSubmitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !canSubmitDetails ||
      !selectedStylist ||
      !selectedService ||
      !selectedDate ||
      !selectedTime
    ) {
      return;
    }

    setAppointmentError("");
    setSubmittingAppointment(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const dateTime = new Date(selectedDate);

      dateTime.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/createAppointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${customerForm.lastName.trim()} ${customerForm.firstName.trim()}`,
          email: customerForm.email.trim(),
          phone: customerForm.phone.trim(),
          dateTime: dateTime.toISOString(),
          stylist_id: selectedStylist.id,
          service_category_id: selectedService.category.id,
          service_ids: [selectedService.id],
          status: "pending",
          note: customerForm.note.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Nem sikerült létrehozni a foglalást.");
      }

      setStep("success");
    } catch (error) {
      console.error(error);
      setAppointmentError(
        error instanceof Error
          ? error.message
          : "Nem sikerült létrehozni a foglalást."
      );
    } finally {
      setSubmittingAppointment(false);
    }
  }

  function resetBooking() {
    setSelectedStylistId("");
    setSelectedServiceId("");
    setSelectedDate(null);
    setSelectedTime("");
    setCustomerForm({
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      note: "",
    });
    setStep("select");
  }

  return (
    <div className="w-full">
      {step === "select" && (
        <Card className="max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl bg-background border-0 shadow-none min-[770px]:overflow-hidden">
          <div className="grid min-h-[calc(100vh-32px)] grid-cols-1 min-[770px]:min-h-[520px] min-[770px]:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            <BookingSidePanel
              stylist={selectedStylist}
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
            />

            <section className="p-4 min-[770px]:p-5 xl:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Válassz szakembert
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Először válaszd ki a szakembert, majd a hozzá tartozó
                  szolgáltatást.
                </p>
              </div>

              <div className="max-w-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stylist">Szakember</Label>

                  {loadingStylists ? (
                    <p className="text-sm text-muted-foreground">
                      Szakemberek betöltése...
                    </p>
                  ) : stylistsError ? (
                    <p className="text-sm text-destructive">{stylistsError}</p>
                  ) : (
                    <Select
                      value={selectedStylistId}
                      onValueChange={(value) => {
                        setSelectedStylistId(value);
                        setSelectedServiceId("");
                        setSelectedDate(null);
                        setSelectedTime("");
                      }}
                    >
                      <SelectTrigger id="stylist" className="h-12 w-full">
                        <SelectValue placeholder="Válassz szakembert" />
                      </SelectTrigger>

                      <SelectContent>
                        {stylists.map((stylist) => (
                          <SelectItem key={stylist.id} value={stylist.id}>
                            {stylist.name || stylist.email}
                            {stylist.role.longName
                              ? ` - ${stylist.role.longName}`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Szolgáltatás</Label>

                  {loadingServices ? (
                    <p className="text-sm text-muted-foreground">
                      Szolgáltatások betöltése...
                    </p>
                  ) : servicesError ? (
                    <p className="text-sm text-destructive">{servicesError}</p>
                  ) : (
                    <Select
                      value={selectedServiceId}
                      disabled={!selectedStylistId}
                      onValueChange={(value) => {
                        setSelectedServiceId(value);
                        setSelectedDate(null);
                        setSelectedTime("");
                      }}
                    >
                      <SelectTrigger id="service" className="h-12 w-full">
                        <SelectValue
                          placeholder={
                            selectedStylistId
                              ? "Válassz szolgáltatást"
                              : "Először válassz szakembert"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {filteredServices.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {service.price} Ft
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {selectedStylistId &&
                    filteredServices.length === 0 &&
                    !loadingServices &&
                    !servicesError && (
                      <p className="text-sm text-destructive">
                        Ehhez a szakemberhez jelenleg nincs elérhető
                        szolgáltatás.
                      </p>
                    )}
                </div>

                {selectedService && (
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="font-medium">{selectedService.name}</p>

                    {selectedService.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedService.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {selectedService.price} Ft
                      </Badge>
                      <Badge variant="outline">
                        {selectedService.category.name}
                      </Badge>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  disabled={!canGoToCalendar}
                  onClick={() => setStep("calendar")}
                  className="h-11 rounded-lg px-6"
                >
                  Időpont választása
                </Button>
              </div>
            </section>
          </div>
        </Card>
      )}

      {step === "calendar" && selectedStylist && selectedService && (
        <Card className="h-[100dvh] max-h-[100dvh] overflow-y-auto rounded-xl bg-background border-0 shadow-none min-[770px]:h-auto min-[770px]:max-h-[570px] min-[770px]:overflow-hidden">
          <div className="grid min-h-0 grid-cols-1 min-[770px]:min-h-[520px] min-[770px]:grid-cols-[240px_minmax(330px,1fr)_220px] xl:grid-cols-[280px_1fr_260px]">
            <BookingSidePanel
              stylist={selectedStylist}
              service={selectedService}
              date={selectedDate}
              time={selectedTime}
              onBack={() => setStep("select")}
            />

            <section className="p-4 min-[770px]:p-5 xl:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  <span className="text-muted-foreground">
                    {currentMonth.getFullYear()}
                  </span>
                </h2>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousMonth}
                    disabled={isCurrentMonth}
                    className="rounded-full disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={goToNextMonth}
                    className="rounded-full"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((date, index) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const isPast = date ? date < today : false;
                  const dateKey = date ? getDateKey(date) : "";
                  const hasAvailableTime = dateKey
                    ? (availableTimesByDate[dateKey] || []).length > 0
                    : false;

                  const isDisabled = isPast || !hasAvailableTime || loadingAvailability;
                  const isSelected =
                    date && selectedDate && isSameDay(date, selectedDate);
                  const isToday = date ? isSameDay(date, today) : false;
                  return (
                    <div key={index}>
                      {date ? (
                        <Button
                          type="button"
                          variant={isSelected ? "default" : "secondary"}
                          disabled={isDisabled}
                          onClick={() => handleSelectDate(date)}
                          className={[
                            "aspect-square h-auto w-full rounded-lg text-sm font-semibold relative flex flex-col items-center justify-center gap-1",
                            !isSelected && !isDisabled
                              ? "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                              : "",
                            isSelected
                              ? "bg-primary text-primary-foreground hover:bg-rose-300"
                              : "",
                          ].join(" ")}
                        >
                          <span>{date.getDate()}</span>
                          {isToday && (
                            <span
                              className={[
                                "h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-primary-foreground" : "bg-primary",
                              ].join(" ")}
                            />
                          )}
                        </Button>
                      ) : (
                        <div />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="border-t p-4 min-[770px]:border-l min-[770px]:border-t-0 min-[770px]:p-5 xl:p-6">
              <h3 className="mb-4 font-semibold">
                {selectedDate ? (
                  <>
                    <span>
                      {selectedDate.toLocaleDateString("hu-HU", {
                        weekday: "short",
                      })}
                    </span>{" "}
                    <span className="text-muted-foreground text-sm">
                      {selectedDate.toLocaleDateString("hu-HU", {
                        day: "2-digit",
                      })}
                    </span>
                  </>
                ) : (
                  "Válasszon napot"
                )}
              </h3>

              {!selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  Az elérhető időpontok megteklintéséhez először válasszon egy napot a naptárban.
                </p>
              ) : (
                <div className="grid max-h-[320px] gap-2 overflow-auto pr-1 min-[770px]:max-h-[430px]">
                  {loadingAvailability ? (
                    <p className="text-sm text-muted-foreground">
                      Elérhető időpontok betöltése...
                    </p>
                  ) : availableTimes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Erre a napra nincs elérhető időpont.
                    </p>
                  ) : (
                    availableTimes.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant="outline"
                        onClick={() => handleSelectTime(time)}
                        className="h-11 justify-center gap-3 rounded-lg border-muted-foreground/30 bg-background shadow-sm"
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {time}
                      </Button>
                    ))
                  )}
                </div>
              )}
            </aside>
          </div>
        </Card>
      )}

      {step === "details" &&
        selectedStylist &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <Card className="max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl bg-background border-0 shadow-none min-[770px]:overflow-hidden">
            <div className="grid grid-cols-1 min-[770px]:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
              <BookingSidePanel
                stylist={selectedStylist}
                service={selectedService}
                date={selectedDate}
                time={selectedTime}
              />

              <form onSubmit={handleSubmitDetails} className="space-y-4 p-4 min-[770px]:space-y-5 min-[770px]:p-5 xl:p-8">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Adja meg az adatait
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Vezetéknév *</Label>
                    <Input
                      id="lastName"
                      className="h-11"
                      value={customerForm.lastName}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">Keresztnév *</Label>
                    <Input
                      id="firstName"
                      className="h-11"
                      value={customerForm.firstName}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail cím *</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="h-11 pl-9"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonszám *</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="h-11 pl-9"
                      placeholder="+36301234567"
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Megjegyzés</Label>
                  <Textarea
                    id="note"
                    placeholder="Ide írhat, ha valami különleges kérése van a foglalással kapcsolatban."
                    rows={4}
                    value={customerForm.note}
                    onChange={(e) =>
                      setCustomerForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                  />
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  A folytatással elfogadod az <span className="font-semibold underline underline-offset-4 hover:cursor-pointer hover:text-foreground">Adatvédelmi tájékoztatót</span> és a <span className="font-semibold underline underline-offset-4 hover:cursor-pointer hover:text-foreground">Foglalási feltételeket</span>.
                </p>
                 {appointmentError && (
                    <p className="text-sm text-destructive">{appointmentError}</p>
                  )}   
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep("calendar")}
                  >
                    Vissza
                  </Button>

                  <Button type="submit" disabled={!canSubmitDetails || submittingAppointment}>
                    {submittingAppointment ? "Foglalás mentése..." : "Rendben"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

      {step === "success" &&
        selectedStylist &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <Card className="mx-auto max-w-2xl overflow-hidden rounded-sm bg-muted/90 shadow-sm p-0">
            <CardHeader className="flex flex-col items-center px-8 py-1 text-center">
              <div className="mt-6 mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-background text-emerald-600 shadow-sm">
                <Check className="h-6 w-6" />
              </div>

              <CardTitle className="text-2xl">
                Időpont sikeresen lefoglalva
              </CardTitle>

              <CardDescription className="max-w-md">
                A foglalás részleteit e-mailben is elküldjük.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className="border rounded-sm border-black/10">
                <div className="rounded-xl bg-background">
                  <div className="px-4 pt-4">
                  <ConfirmRow label="Elnevezés">
                    <span>
                      {selectedService.name} - {customerForm.lastName}{" "}
                      {customerForm.firstName}
                    </span>
                  </ConfirmRow>

                  <ConfirmRow label="Mikor">
                    <span>
                      {formatDate(selectedDate)}
                      <br />
                      {formatTimeWithPeriod(selectedTime)}
                    </span>
                  </ConfirmRow>

                  <ConfirmRow label="Szakember">
                    <span>
                        {selectedStylist.image ? (
                          <img
                            src={selectedStylist.image}
                            alt={selectedStylist.name || selectedStylist.email}
                            className="mr-2 inline h-6 w-6 rounded-full"
                          />
                        ) : (
                          <UserRound className="mr-2 inline h-6 w-6 rounded-full" />
                        )}
                      {selectedStylist.name || selectedStylist.email}{" "}
                      -{" "}
                      <span className="text-muted-foreground">
                        {selectedStylist.role.longName ||
                          selectedStylist.role.name}
                      </span>
                    </span>
                  </ConfirmRow>

                   <ConfirmRow label="Szolgáltatás">
                    <span>{selectedService.name}</span>
                  </ConfirmRow>

                  <ConfirmRow label="Vendég"> 
                    <span>
                      {customerForm.lastName} {customerForm.firstName}
                      <br />
                      <span className="text-muted-foreground">
                        <Mail className="mr-1 inline h-3 w-3" />
                        {customerForm.email}
                      </span>
                      <br />
                      <span className="text-muted-foreground">
                        <Phone className="mr-1 inline h-3 w-3" />
                        {customerForm.phone}
                      </span>
                    </span>
                  </ConfirmRow>

                  <ConfirmRow label="Helyszín" isLast>
                    <span>1134 Budapest, Apály u. 2/D</span>
                  </ConfirmRow>

                  <div className="flex flex-col items-center justify-center gap-4 border-t pt-8 pb-8 sm:flex-row">
                    <span className="text-m font-medium">
                        Hozzáadás naptárhoz
                    </span>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" type="button">
                        G
                        </Button>
                        <Button variant="outline" size="icon" type="button">
                        ◎
                        </Button>
                        <Button variant="outline" size="icon" type="button">
                        O
                        </Button>
                        <Button variant="outline" size="icon" type="button">
                        ICS
                        </Button>
                    </div>
                  </div>
                </div>
                </div>              
              </div>

              <div className="font-medium px-8 py-4 text-center text-sm text-muted-foreground">
                Változtatna valamin?{" "}
                <button
                  type="button"
                  onClick={() => setStep("calendar")}
                  className="underline underline-offset-4 hover:cursor-pointer"
                >
                  Átütemezés
                </button>{" "}
                vagy{" "}
                <button
                  type="button"
                  onClick={resetBooking}
                  className="underline underline-offset-4 hover:cursor-pointer"
                >
                  Új foglalás
                </button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function BookingSidePanel({
  stylist,
  service,
  date,
  time,
  onBack,
}: {
  stylist?: Stylist;
  service?: Service;
  date?: Date | null;
  time?: string;
  onBack?: () => void;
}) {
  return (
    <aside className="border-b p-4 min-[770px]:border-b-0 min-[770px]:border-r min-[770px]:p-5 xl:p-6">
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-transparent">
        {stylist?.name || stylist?.email || stylist?.image ? (
            <span className="text-foreground text-sm font-semibold border-2 border-muted rounded-full h-9 w-9 flex items-center justify-center">
            {stylist.image ? (
              <Image
                src={stylist.image}
                alt={stylist.name || "Stylist"}
                fill
                sizes="36px"
                className="object-cover rounded-full"
                priority
              />
            ) : (
              <span className="text-foreground">
                {(stylist.name || stylist.email)?.charAt(0).toUpperCase()}
              </span>
            )}
            </span>
        ) : (
            <Image
            src={LOGO_BLACK}
            alt="AtriumBeautyLogo"
            fill
            sizes="36px"
            className="object-contain"
            priority
            />
        )}
        </div>

      <p className="flex items-center gap-2 mt-4 text-sm font-medium text-muted-foreground">
        {stylist?.name || "Válassz szakembert"}
        {stylist?.role && (
            <Badge variant="secondary">
            {stylist.role.longName || stylist.role.name}
            </Badge>
        )}
      </p>

      <h2 className="mt-1 text-2xl font-semibold tracking-tight">
        {service?.name || "Időpontfoglalás"}
      </h2>

      <div className="mt-5 space-y-4 text-sm text-foreground/80 font-medium">
        {date && time && (
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4" />
            <span>
              {formatShortDate(date)}
              <br />
              {formatTimeWithPeriod(time)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4" />
          <span>30 perc</span>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4" />
          <span>{ADDRESS}</span>
        </div>

        <div className="flex items-center gap-3">
          <Globe2 className="h-4 w-4" />
          <span>Europe/Budapest</span>
        </div>
      </div>

      {onBack && (
        <>
          <Separator className="my-6" />

          <Button type="button" variant="secondary" onClick={onBack}>
            Vissza
          </Button>
        </>
      )}
    </aside>
  );
}

function ConfirmRow({
  label,
  children,
  isLast,
}: {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={[
        "grid grid-cols-[140px_1fr] gap-6 px-6 py-3 text-sm",
        isLast ? "mb-6" : "",
      ].join(" ")}
    >
      <div className="font-medium text-foreground">{label}</div>
      <div className="leading-relaxed text-foreground">{children}</div>
    </div>
  );
}