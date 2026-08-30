"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarClock } from "lucide-react";
import { hu } from "date-fns/locale";

export function DateTimePicker24h({
  selected,
  onSelect,
}: {
  selected?: Date;
  onSelect?: (date: Date) => void;
}) {
  const [date, setDate] = React.useState<Date | undefined>(selected);
  const [isOpen, setIsOpen] = React.useState(false);
  const popupRef = React.useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 2 }, (_, i) => i * 30);

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      setDate(d);
      onSelect?.(d);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: number) => {
    if (!date) return;
    const newDate = new Date(date);
    if (type === "hour") newDate.setHours(value);
    else newDate.setMinutes(value);
    setDate(newDate);
    onSelect?.(newDate);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-full">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <CalendarClock className="mr-2 h-4 w-4" />
        {date ? format(date, "yyyy. MMMM d. HH:mm", { locale: hu }) : "yyyy. MMMM d. HH:mm"}
      </Button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute left-0 mt-2 bg-background shadow-md p-2 flex sm:flex-row gap-2 z-50 border rounded-md"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={hu}
          />

          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    type="button"
                    key={hour}
                    size="icon"
                    variant={date?.getHours() === hour ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>

            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    type="button"
                    key={minute}
                    size="icon"
                    variant={date?.getMinutes() === minute ? "default" : "ghost"}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
