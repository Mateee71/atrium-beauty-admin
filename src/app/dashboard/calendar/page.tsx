"use client"

import React, { useState } from "react"
import { ClientContainer } from "@/calendar/components/client-container"
import type { TCalendarView } from "@/calendar/types"

export default function CalendarPage() {
  const [view, setView] = useState<TCalendarView>("month")

  return (
    <div className="w-full">
      <div className="flex items-center py-4 w-full">
        <ClientContainer view={view} onViewChange={setView} />
      </div>
    </div>
  )
}
