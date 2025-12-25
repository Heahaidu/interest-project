"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "./label"
import { Input } from "./input"

interface Calendar24Props {
  dateLabel?: string
  timeLabel?: string
  value?: string
  onChange?: (value: string) => void
}


export function Calendar24({
  dateLabel = "Date",
  timeLabel = "Time",
  value,
  onChange,
}: Calendar24Props) {

  const parsedDate = value ? new Date(value) : undefined

  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(parsedDate)
  const [time, setTime] = React.useState(
    parsedDate ? format(parsedDate, "HH:mm:ss") : "10:00:00"
  )

  // Sync từ ngoài vào (khi edit event)
  React.useEffect(() => {
    if (value) {
      const d = new Date(value)
      setDate(d)
      setTime(format(d, "HH:mm:ss"))
    }
  }, [value])

  const emitChange = (d?: Date, t?: string) => {
    if (!d || !t) return
    const [h, m, s] = t.split(":").map(Number)
    const merged = new Date(d)
    merged.setHours(h, m, s || 0)
    onChange?.(merged.toISOString())
  }

  return (
    <div className="flex gap-4">
      {/* DATE */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {dateLabel}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-32 justify-between font-normal">
              {date ? format(date, "dd/MM/yyyy") : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="z-[150] w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
                emitChange(d, time)
              }}
              disabled={(d) => 
                d < (new Date())
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* TIME */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {timeLabel}
        </Label>

        <Input
          type="time"
          step="1"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            emitChange(date, e.target.value)
          }}
        />
      </div>
    </div>
  )
}
