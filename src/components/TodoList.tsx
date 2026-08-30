"use client";

import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { hu } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Icon } from "@iconify/react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { IMAGE_NOT_AVAILABLE } from "../config";

type TodoListItem = {
  id: string;
  date: string;
  title: string;
  badge: string;
  image: string | null;
  icon?: string | null;
  count: string;
};

const TodoList = ({ list }: { list: TodoListItem[] }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  const selectedDate = date ?? new Date();

  const filteredList = useMemo(() => {
    return list.filter((item) => isSameDay(new Date(item.date), selectedDate));
  }, [list, selectedDate]);

  const title = `${format(selectedDate, "yyyy MMM d", {
    locale: hu,
  })}-i ügyfelek`;

  return (
    <div className="min-h-0">
      <h1 className="mb-6 text-lg font-medium">
        {title} - {filteredList.length}db
      </h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full">
            <CalendarIcon />
            {format(selectedDate, "yyyy. MMMM d.", { locale: hu })}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              setDate(selectedDate);
              setOpen(false);
            }}
            classNames={{
              today:
                "relative rounded-md bg-accent text-accent-foreground after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
            }}
          />
        </PopoverContent>
      </Popover>

      <ScrollArea className="mt-4 h-[400px] overflow-y-auto pr-3">
        {filteredList.length === 0 ? (
          <div className="flex h-[160px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
            Erre a napra nincs ügyfél.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredList.map((item) => (
              <Card
                key={item.id}
                className="flex-row items-center justify-between gap-4 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon icon={item.icon || "lucide:sparkles"} className="size-6" />
                </div>

                <CardContent className="flex-1 p-0">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <Badge variant="secondary">{item.badge}</Badge>
                </CardContent>

                <CardFooter className="p-0">{item.count}</CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TodoList;