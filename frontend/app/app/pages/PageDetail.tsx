'use client';

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios, { api, endpoints } from "@/lib/APIs";

interface PageDetailProps {
  pageId: string;           // nhận pageId từ Page.tsx
  onBack: () => void;       // nút Back để quay lại list
}

interface Event {
  id: string;
  title: string;
  date: string;
}

interface PageData {
  uuid: string;
  name: string;
  pageType: string;
  description: string;
  coverImageUrl: string;
  avatarUrl: string;
  followerCount: number;
  isPublic: boolean;
  isVerified: boolean;
  eventCount: number;
}

export default function PageDetail({ pageId, onBack }: PageDetailProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Page Info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(endpoints["page-detail"](pageId));
        setPage(res.data);

        //fetch events khi có API:

      } catch (err) {
        console.error("Failed to fetch page detail", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId]);
  useEffect(() => {
    console.log("pageId nhận được:", pageId);
  }, [pageId]);

  if (loading) return <p className="p-4">Loading page detail...</p>;
  if (!page) return <p className="p-4">Page not found.</p>;

  return (
    <div className="max-w-7xl mx-auto p-4">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 dark:bg-[#222] rounded"
      >
        ← Back
      </button>

      {/* COVER IMAGE */}
      <div className="relative">
        <img
          src={page.coverImageUrl}
          alt="Cover"
          className="w-full h-56 object-cover rounded-b"
        />

        {/* AVATAR + INFO */}
        <div className="absolute -bottom-12 left-6 flex items-center gap-4">
          <img
            src={page.avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
          />

          <div className="bg-white dark:bg-[#111] p-4 rounded shadow w-[400px]">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {page.name}
              {page.isVerified && (
                <span className="text-blue-500 text-sm">✔ Verified</span>
              )}
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              {page.pageType}
            </p>

            <p className="text-gray-500 dark:text-gray-400">
              {page.followerCount.toLocaleString()} followers
            </p>

            {!page.isPublic && (
              <p className="text-red-500 mt-1">This page is private</p>
            )}

            <p className="text-gray-700 dark:text-gray-300 mt-2">
              {page.description}
            </p>
          </div>
        </div>
      </div>

      {/* SPACER */}
      <div className="h-16"></div>

      {/* CONTENT: Events + Calendar */}
      <div className="flex gap-6">

        {/* EVENTS */}
        <div className="flex-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ADD EVENT BUTTON */}
          <div className="col-span-full">
            <button
              onClick={() => alert("Open add event form/modal")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Add Event
            </button>
          </div>

          {events.length > 0 ? (
            events.map(event => (
              <div
                key={event.id}
                className="p-4 border rounded shadow-sm bg-white dark:bg-[#0a0a0a]"
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {event.date}
                </p>
              </div>
            ))
          ) : (
            <p>No events yet.</p>
          )}
        </div>

        {/* CALENDAR */}
        <div className="flex-1">
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
