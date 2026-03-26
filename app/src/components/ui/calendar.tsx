"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      classNames={{
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
        ),
        month: cn("flex flex-col w-full gap-4"),
        caption: cn(
          "flex items-center justify-center h-10 w-full relative",
        ),
        caption_label: cn(
          "select-none font-medium text-sm",
        ),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-0",
        ),
        nav_button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 aria-disabled:opacity-50 p-0 select-none",
        ),
        nav_button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 aria-disabled:opacity-50 p-0 select-none",
        ),
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
        ),
        row: cn("flex w-full mt-2"),
        cell: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "[&:has([aria-selected].day-today)]:bg-accent/50",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-normal aria-selected:opacity-100 [&:has([aria-selected])]:rounded-none [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md hover:aria-selected:bg-primary focus:z-[1]",
          "aria-selected:bg-primary aria-selected:text-primary-foreground hover:aria-selected:bg-primary focus:aria-selected:bg-primary",
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          "day-disabled text-muted-foreground opacity-50",
          "day-hidden invisible",
        ),
        day_range_start: "day-range-start rounded-l-md",
        day_range_end: "day-range-end rounded-r-md",
        day_range_middle: "rounded-none day-range-middle",
        day_selected: "rounded-md",
        day_today: "day-today bg-accent text-accent-foreground",
        day_outside: "day-outside",
        day_disabled: "day-disabled",
        day_hidden: "day-hidden",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon className="size-4" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon className="size-4" {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
