import { format } from "date-fns";

import { useDisclosure } from "@/hooks/use-disclosure";

import { Button } from "@/components/ui/button";
import { SingleCalendar } from "@/components/ui/single-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import type { ButtonHTMLAttributes } from "react";
import { DatePicker } from "react-aria-components";
import { DateTimePicker24h } from "./DateTimePicker24h";

type TProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect" | "value"> & {
  onSelect: (value: Date | undefined) => void;
  value?: Date | undefined;
  placeholder: string;
  labelVariant?: "P" | "PP" | "PPP";
};

function SingleDayPicker({ id, onSelect, className, placeholder, labelVariant = "PPP", value, ...props }: TProps) {

  const handleSelect = (date: Date | undefined) => {
    onSelect(date);
  };

  return (
   <DateTimePicker24h selected={value} onSelect={handleSelect}/>
  );
}

export { SingleDayPicker };
