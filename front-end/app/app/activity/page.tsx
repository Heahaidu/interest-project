"use client";

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { authApis, endpoints } from "@/lib/APIs";
import { toast } from "sonner";
import { ActivityTab, Event } from "@/lib/types";
import { Activity, CalendarIcon, CheckCircle2, Clock, Heart, History, MapPin, MessageSquare, Search, Star, Trophy, XCircle } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

function CalendarSelect() {
  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);
  console.log(from + ' ' + to)
  from.setDate(from.getDate() - 3)
  to.setDate(to.getDate() + 3)
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: from,
    to: to,
  })
  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={setDateRange}
      numberOfMonths={1}
      className="rounded-lg border bg-white dark:bg-[#121212] shadow-sm border-gray-100 dark:border-white/5 w-65"
    />
  )
}

export default function ActivityPage() {
  let activityEvents: Event[] = [];
  let pastRegisteredEvents: Event[] = [];
  const [events, setEvents] = useState<Event[]>([]);
  const [activityTab, setActivityTab] = useState<ActivityTab>('registered');
  const [cancelledEvents, setCancelledEvents] = useState<Event[]>([]);

  const sortEventsByDate = (a: Event, b: Event) => {
    const currentYear = new Date().getFullYear();
    const dateA = new Date(`${a.startTime}, ${currentYear} ${a.startTime}`);
    const dateB = new Date(`${b.startTime}, ${currentYear} ${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  };

  switch (activityTab) {
    case "registered":
      activityEvents = events
        .filter((e) => e.isRegistered && !e.isEnded )
        .sort(sortEventsByDate);
      pastRegisteredEvents = events.filter(
        (e) => e.isRegistered && e.isEnded);
      break;
    case "attended":
      activityEvents = events.filter(
        (e) =>
          e.isRegistered &&
          e.isEnded &&
          e.hasCheckedIn !== false
      );
      break;
    case "missed":
      activityEvents = events.filter(
        (e) =>
          e.isRegistered &&
          e.isEnded &&
          e.hasCheckedIn === false
      );
      break;
    case "cancelled":
      activityEvents = cancelledEvents;
      break;
  }

  const renderActivityItem = (event: Event, isDimmed: boolean = false) => (
    <div
      key={event.uuid}
      onClick={() => {}}
      className={`bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex gap-4 items-center cursor-pointer hover:shadow-lg transition-all group ${
        isDimmed
          ? "opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0"
          : "hover:-translate-y-1"
      }`}
    >
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 relative">
        <img src={event.imageUrl} className="w-full h-full object-cover" />
        {activityTab === "registered" && !event.isEnded && (
          <div className="absolute bottom-0 left-0 right-0 bg-brand-purple/90 text-white text-[10px] font-bold text-center py-1">
            UPCOMING
          </div>
        )}
        {activityTab === "cancelled" && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <XCircle className="text-white" size={24} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3
              className={`font-bold text-lg text-gray-900 dark:text-white truncate pr-2 ${
                activityTab === "cancelled"
                  ? "line-through text-gray-400"
                  : ""
              }`}
            >
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <CalendarIcon size={12} /> <span>{event.startTime}</span>
              <Clock size={12} /> <span>{event.startTime}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={12} />{" "}
              <span className="truncate max-w-[200px]">{event.location}</span>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            {activityTab === "registered" && !event.isEnded && (
              <button
                className="p-2 rounded-full bg-gray-50 dark:bg-white/5 text-brand-purple hover:bg-brand-purple hover:text-white transition-colors"
                title="Check-in QR"
              >
                <CheckCircle2 size={20} />
              </button>
            )}
            {activityTab === "cancelled" && (
              <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                Cancelled
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const totalEvents = events.filter((e) => e.isRegistered && e.isEnded).length;
  const totalReviews = 12;
  const upcomingCount = events.filter(
    (e) => e.isRegistered && !e.isEnded
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 animate-in fade-in duration-300">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
            <Trophy size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {totalEvents}
            </div>
            <div className="text-xs text-gray-500 uppercase font-bold">
              Events Attended
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-brand-purple rounded-full flex items-center justify-center">
            <CalendarIcon size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {upcomingCount}
            </div>
            <div className="text-xs text-gray-500 uppercase font-bold">
              Upcoming Plans
            </div>
          </div>
        </div>
        {/* <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-full flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {totalReviews}
            </div>
            <div className="text-xs text-gray-500 uppercase font-bold">
              Reviews Left
            </div>
          </div>
        </div> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex overflow-x-auto gap-2 mb-6 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full sm:w-fit no-scrollbar">
            {(
              ["registered", "attended", "missed", "cancelled"] as ActivityTab[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActivityTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  activityTab === tab
                    ? "bg-white text-black shadow-sm dark:bg-[#121212] dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activityEvents.length === 0 &&
            pastRegisteredEvents.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-[#121212] rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} />
                </div>
                <p>No events found in {activityTab}.</p>
              </div>
            ) : (
              <>
                {activityTab === "registered" ? (
                  <>
                    {activityEvents.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                          Upcoming
                        </h3>
                        <div className="space-y-4">
                          {activityEvents.map((e) => renderActivityItem(e))}
                        </div>
                      </div>
                    )}
                    {pastRegisteredEvents.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">
                          Past Events
                        </h3>
                        <div className="space-y-4">
                          {pastRegisteredEvents.map((e) =>
                            renderActivityItem(e, true)
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  activityEvents.map((e) => renderActivityItem(e))
                )}
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-65 space-y-6">
          {/* <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                August 2024
              </h3>
              <button className="text-xs font-bold text-brand-purple hover:underline">
                Today
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <div className="text-gray-400 font-bold">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const hasEvent = [5, 12].includes(day);
                return (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-lg relative ${
                      hasEvent
                        ? "bg-purple-100 dark:bg-purple-900/30 text-brand-purple font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                    {hasEvent && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-purple"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div> */}
          <CalendarSelect/>

          {/* <div className="bg-white dark:bg-[#121212] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <History size={16} /> Recent History
            </h3>
            <div className="space-y-4 relative">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-white/5"></div>

              {[
                {
                  text: "You registered for Tech Conf",
                  time: "2h ago",
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  text: "Liked Summer Music Festival",
                  time: "5h ago",
                  icon: Heart,
                  color: "text-red-500",
                },
                {
                  text: "Commented on Alex's post",
                  time: "1d ago",
                  icon: MessageSquare,
                  color: "text-blue-500",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 relative z-10">
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-[#121212] border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full bg-current ${item.color}`}
                    ></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
