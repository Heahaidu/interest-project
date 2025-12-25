import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Event } from "@/lib/types";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventStore } from "@/hooks/useEventStore";

interface AutoBannerProps {
  events: Event[];
}

export default function AutoBanner({ events }: AutoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = events.slice(0, 5);

  const router = useRouter();
  const params = useSearchParams();
  const setSelectedEvent = useEventStore((e) => e.setSelectedEvent);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const currentEvent = featured[currentIndex];

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleOnSelected = (e: Event) => {
    const p = new URLSearchParams(params.toString());
    p.set(`e`, e.uuid);
    setSelectedEvent(e);
    router.push(`/app/discover?${p.toString()}`, { scroll: false });
  };

  return (
    <div
      className="cursor-pointer relative w-full h-64 md:h-80 rounded-sm overflow-hidden mb-8 group shadow-xl"
      onClick={() => handleOnSelected(currentEvent)}
    >
      {/* Background Image */}
      <img
        src={
          currentEvent.imageUrl || "../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png"
        }
        onError={(events: React.SyntheticEvent<HTMLImageElement>) => {
          const target = events.currentTarget;
          target.src = "../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png";
          target.className =
            "w-full h-full object-cover transition-transform duration-700";
        }}
        alt={currentEvent.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
          {currentEvent.title}
        </h2>
        <div className="flex items-center gap-4 text-gray-200 text-sm font-medium">
          <span className="flex items-center gap-1">
            <Calendar size={16} />{" "}
            {format(currentEvent.startTime, "yyyy MMM dd")}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} /> {format(currentEvent.startTime, "HH:mm")}
          </span>
          <span>{currentEvent.location}</span>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="z-20 flex cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronRight size={24} />
      </button>
      {/* Indicators */}
      <div className="absolute items-center bottom-6 right-6 flex gap-2">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={(e: React.MouseEvent) => {e.stopPropagation(); setCurrentIndex(idx)}}
            className={`cursor-pointer w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-white w-10"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
