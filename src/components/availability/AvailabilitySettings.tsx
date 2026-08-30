"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

type Interval = {
  startTime: string;
  endTime: string;
};

type AvailabilityDay = {
  dayOfWeek: number;
  enabled: boolean;
  intervals: Interval[];
};

type AvailabilityOverride = {
  date: string;
  disabled: boolean;
  intervals: Interval[];
};

type Props = {
  userId?: string;
  canEdit: boolean;
  mode?: "user" | "default";
};

const dayLabels = [
  "Vasárnap",
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
];

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const defaultDays: AvailabilityDay[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  dayOfWeek: day,
  enabled: [1, 2, 3, 4, 5].includes(day),
  intervals: [1, 2, 3, 4, 5].includes(day)
    ? [{ startTime: "09:00", endTime: "17:00" }]
    : [],
}));

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value.toISOString();
}

export default function AvailabilitySettings({ userId, canEdit, mode = "user" }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [defaultAvailability, setDefaultAvailability] = useState<any | null>(null);

  const [days, setDays] = useState<AvailabilityDay[]>(defaultDays);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);

  useEffect(() => {
    async function loadAvailability() {
      setLoading(true);

      const endpoint =
        mode === "default"
            ? "/api/availability/default"
            : `/api/availability?userId=${userId}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setDefaultAvailability(data.defaultAvailability || null);
        setDays(
          data.data.days.map((day: any) => ({
            dayOfWeek: day.dayOfWeek,
            enabled: day.enabled,
            intervals: day.intervals.map((interval: any) => ({
              startTime: interval.startTime,
              endTime: interval.endTime,
            })),
          }))
        );

        setOverrides(
         (data.data.overrides || []).map((override: any) => ({
            date: override.date,
            disabled: override.disabled,
            intervals: override.intervals.map((interval: any) => ({
            startTime: interval.startTime,
            endTime: interval.endTime,
            })),
         }))
        );
      }

      setLoading(false);
    }

    loadAvailability();
  }, [userId, mode]);

  const updateDay = (dayOfWeek: number, nextDay: Partial<AvailabilityDay>) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...nextDay } : day
      )
    );
  };

  const updateInterval = (
    dayOfWeek: number,
    index: number,
    nextInterval: Partial<Interval>
  ) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        return {
          ...day,
          intervals: day.intervals.map((interval, intervalIndex) =>
            intervalIndex === index
              ? { ...interval, ...nextInterval }
              : interval
          ),
        };
      })
    );
  };

  const addInterval = (dayOfWeek: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              enabled: true,
              intervals: [
                ...day.intervals,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : day
      )
    );
  };

  const removeInterval = (dayOfWeek: number, index: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              intervals: day.intervals.filter((_, itemIndex) => itemIndex !== index),
            }
          : day
      )
    );
  };

  const addOverride = (date: Date | undefined) => {
    if (!date) return;

    const value = toDateInputValue(date);
    const exists = overrides.some(
      (override) => new Date(override.date).toDateString() === new Date(value).toDateString()
    );

    if (exists) {
      toast.error("Ehhez a naphoz már van override.");
      return;
    }

    setOverrides((prev) => [
      ...prev,
      {
        date: value,
        disabled: false,
        intervals: [{ startTime: "09:00", endTime: "17:00" }],
      },
    ]);
  };

  const updateOverride = (
    index: number,
    nextOverride: Partial<AvailabilityOverride>
  ) => {
    setOverrides((prev) =>
      prev.map((override, itemIndex) =>
        itemIndex === index ? { ...override, ...nextOverride } : override
      )
    );
  };

  const updateOverrideInterval = (
    overrideIndex: number,
    intervalIndex: number,
    nextInterval: Partial<Interval>
  ) => {
    setOverrides((prev) =>
      prev.map((override, itemIndex) => {
        if (itemIndex !== overrideIndex) return override;

        return {
          ...override,
          intervals: override.intervals.map((interval, index) =>
            index === intervalIndex
              ? { ...interval, ...nextInterval }
              : interval
          ),
        };
      })
    );
  };

  const addOverrideInterval = (overrideIndex: number) => {
    setOverrides((prev) =>
      prev.map((override, index) =>
        index === overrideIndex
          ? {
              ...override,
              disabled: false,
              intervals: [
                ...override.intervals,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : override
      )
    );
  };

    const getDefaultDay = (dayOfWeek: number) => {
        return defaultAvailability?.days?.find(
            (day: any) => day.dayOfWeek === dayOfWeek
        );
    };

    const getDefaultOverrideForDate = (date: Date) => {
        return defaultAvailability?.overrides?.find((override: any) => {
            const overrideDate = new Date(override.date);
            return overrideDate.toDateString() === date.toDateString();
        });
        };

        const isDateGloballyDisabled = (date: Date) => {
        if (mode === "default") return false;

        const defaultOverride = getDefaultOverrideForDate(date);

        if (defaultOverride?.disabled) {
            return true;
        }

        const defaultDay = getDefaultDay(date.getDay());

        if (!defaultDay?.enabled) {
            return true;
        }

        return false;
    };

    const isIntervalInsideDefault = (
        dayOfWeek: number,
        startTime: string,
        endTime: string
        ) => {
        if (mode === "default") return true;

        const defaultDay = getDefaultDay(dayOfWeek);

        if (!defaultDay?.enabled) return false;

        return defaultDay.intervals.some((interval: any) => {
            return startTime >= interval.startTime && endTime <= interval.endTime;
        });
    };

    const getAllowedStartTimes = (dayOfWeek: number) => {
        if (mode === "default") return timeOptions;

        const defaultDay = getDefaultDay(dayOfWeek);

        if (!defaultDay?.enabled) return [];

        return timeOptions.filter((time) =>
            defaultDay.intervals.some((interval: any) => {
            return time >= interval.startTime && time < interval.endTime;
            })
        );
        };

        const getAllowedEndTimes = (dayOfWeek: number, startTime: string) => {
        if (mode === "default") return timeOptions;

        const defaultDay = getDefaultDay(dayOfWeek);

        if (!defaultDay?.enabled) return [];

        return timeOptions.filter((time) =>
            defaultDay.intervals.some((interval: any) => {
            return (
                time > startTime &&
                time <= interval.endTime &&
                startTime >= interval.startTime
            );
            })
        );
        };


    const removeOverride = (index: number) => {
        setOverrides((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    };

    const getDefaultIntervalsForDate = (date: string) => {
        if (mode === "default") return null;

        const selectedDate = new Date(date);
        const defaultOverride = getDefaultOverrideForDate(selectedDate);

        if (defaultOverride) {
            if (defaultOverride.disabled) return [];

            return defaultOverride.intervals;
        }

        const defaultDay = getDefaultDay(selectedDate.getDay());

        if (!defaultDay?.enabled) return [];

        return defaultDay.intervals;
        };

        const getAllowedOverrideStartTimes = (date: string) => {
        if (mode === "default") return timeOptions;

        const intervals = getDefaultIntervalsForDate(date);

        if (!intervals) return timeOptions;

        return timeOptions.filter((time) =>
            intervals.some((interval: any) => {
            return time >= interval.startTime && time < interval.endTime;
            })
        );
        };

        const getAllowedOverrideEndTimes = (date: string, startTime: string) => {
        if (mode === "default") return timeOptions;

        const intervals = getDefaultIntervalsForDate(date);

        if (!intervals) return timeOptions;

        return timeOptions.filter((time) =>
            intervals.some((interval: any) => {
            return (
                time > startTime &&
                time <= interval.endTime &&
                startTime >= interval.startTime
            );
            })
        );
        };

  const saveAvailability = async () => {
    if (mode === "user") {
    for (const day of days) {
        if (!day.enabled) continue;

        const defaultDay = getDefaultDay(day.dayOfWeek);

        if (!defaultDay?.enabled) {
        toast.error(`${dayLabels[day.dayOfWeek]} globálisan nem elérhető.`);
        return;
        }

        for (const interval of day.intervals) {
        if (
            !isIntervalInsideDefault(
            day.dayOfWeek,
            interval.startTime,
            interval.endTime
            )
        ) {
            toast.error(
            `${dayLabels[day.dayOfWeek]}: az idősáv csak a globális elérhetőségen belül lehet.`
            );
            return;
        }
        }
    }

    for (const override of overrides) {
        const overrideDate = new Date(override.date);

        if (isDateGloballyDisabled(overrideDate)) {
        toast.error(
            `${formatDate(override.date)} globálisan tiltva van, ezért nem állítható elérhetőre.`
        );
        return;
        }
    }
    }

    setSaving(true);

    const res = await fetch(
        mode === "default" ? "/api/availability/default" : "/api/availability",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        mode === "default"
            ? { days, overrides }
            : {
                userId,
                days,
                overrides,
            }
        ),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Elérhetőség mentve.");
    } else {
      toast.error(data.error || "Nem sikerült menteni az elérhetőséget.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Elérhetőség betöltése...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "default" ? "Globális elérhetőség" : "Elérhetőség"}
          </h2>
          <p className="text-sm text-muted-foreground">
           {mode === "default"
            ? "Ez lesz az alap heti elérhetőség azoknál a szakembereknél, akiknek nincs saját beállításuk."
            : "Állítsd be, mely napokon és időpontokban foglalható a szakember."}
          </p>
        </div>

        {canEdit && (
          <Button onClick={saveAvailability} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Mentés
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day.dayOfWeek}
            className="grid gap-3 rounded-lg border p-3 md:grid-cols-[130px_1fr_auto]"
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={day.enabled}
                disabled={!canEdit || (mode === "user" && !getDefaultDay(day.dayOfWeek)?.enabled)}
                onCheckedChange={(checked) =>
                  updateDay(day.dayOfWeek, {
                    enabled: checked,
                    intervals:
                      checked && day.intervals.length === 0
                        ? [{ startTime: "09:00", endTime: "17:00" }]
                        : day.intervals,
                  })
                }
              />
              <span className="font-medium">{dayLabels[day.dayOfWeek]}</span>
            </div>

            <div className="space-y-2"> 
              {!day.enabled ? (
                <div className="flex min-h-9 items-center">
                    <p className="text-sm text-muted-foreground">Nem elérhető</p>
                </div>
              ) : (
                day.intervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                        value={interval.startTime}
                        disabled={!canEdit}
                        onValueChange={(value) =>
                            updateInterval(day.dayOfWeek, index, {
                            startTime: value,
                            })
                        }
                        >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                            {getAllowedStartTimes(day.dayOfWeek).map((time) => (
                            <SelectItem key={time} value={time}>
                                {time}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">-</span>

                        <Select
                        value={interval.endTime}
                        disabled={!canEdit}
                        onValueChange={(value) =>
                            updateInterval(day.dayOfWeek, index, {
                            endTime: value,
                            })
                        }
                        >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                            {getAllowedEndTimes(day.dayOfWeek, interval.startTime).map((time) => (
                            <SelectItem key={time} value={time}>
                                {time}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                    {canEdit && day.intervals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInterval(day.dayOfWeek, index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            {canEdit && (
              <div className="flex items-start gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => addInterval(day.dayOfWeek)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Egyéni időpontok</h3>
          <p className="text-sm text-muted-foreground">
            Adj hozzá egyedi napokat, amikor eltér az elérhetőség vagy nem elérhető.
          </p>
        </div>

        {canEdit && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Plus className="size-4" />
                Hozzáadás
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                disabled={(date) => isDateGloballyDisabled(date)}
                onSelect={(date) => {
                    if (!date || isDateGloballyDisabled(date)) return;
                    addOverride(date);
                }}
                classNames={{
                  today:
                    "relative rounded-md bg-accent text-accent-foreground after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                }}
              />
            </PopoverContent>
          </Popover>
        )}

        <div className="mt-4 space-y-3">
          {overrides.map((override, overrideIndex) => (
            <div key={override.date} className="rounded-lg border p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{formatDate(override.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    Egyedi elérhetőség erre a napra.
                  </p>
                </div>

                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOverride(overrideIndex)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              <div className="mb-3 flex items-center gap-3">
                <Switch
                  checked={override.disabled}
                  disabled={!canEdit}
                  onCheckedChange={(checked) =>
                    updateOverride(overrideIndex, {
                      disabled: checked,
                      intervals: checked ? [] : [{ startTime: "09:00", endTime: "17:00" }],
                    })
                  }
                />
                <span className="text-sm">Nem elérhető ezen a napon</span>
              </div>

              {!override.disabled && (
                <div className="space-y-2">
                  {override.intervals.map((interval, intervalIndex) => (
                    <div key={intervalIndex} className="flex items-center gap-2">
                      <Select
                        value={interval.startTime}
                        disabled={!canEdit}
                        onValueChange={(value) =>
                            updateOverrideInterval(overrideIndex, intervalIndex, {
                                startTime: value,
                            })
                        }
                        >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                            {getAllowedOverrideStartTimes(override.date).map((time) => (
                            <SelectItem key={time} value={time}>
                                {time}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">-</span>

                        <Select
                        value={interval.endTime}
                        disabled={!canEdit}
                        onValueChange={(value) =>
                            updateOverrideInterval(overrideIndex, intervalIndex, {
                                endTime: value,
                            })
                        }
                        >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                            {getAllowedOverrideEndTimes(
                            override.date,
                            interval.startTime
                            ).map((time) => (
                            <SelectItem key={time} value={time}>
                                {time}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                  ))}

                  {canEdit && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addOverrideInterval(overrideIndex)}
                    >
                      <Plus className="size-4" />
                      Idősáv hozzáadása
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {overrides.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Még nincs hozzáadott egyedi nap.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}