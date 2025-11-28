'use client';

import { FEATURED_EVENTS } from '@/lib/constants';
import { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';

const imgArrow1 = "/6bdc27aa1a1406a9e69121a0cafcdc27e63d920a.png";
const imgArrow2 = "/cba98c7ba393a1dde9fbc17c94f53dc2996cf11d.png";
const imgArrow3 = "/497a29819744ed6af296e1e8a4df601683b7413e.png";
const imgArrow4 = "/cba98c7ba393a1dde9fbc17c94f53dc2996cf11d.png";
const imgArrow5 = "/497a29819744ed6af296e1e8a4df601683b7413e.png";

type TimelineTagProps = {
  className?: string;
  variant?: "Top" | "Mid" | "MidMile";
  date: string;
};
function TimelineTag({
  className,
  variant = "Top",
  date
}: TimelineTagProps) {
  if (variant === "MidMile") {
    return (
      <div className={"content-stretch flex h-[60px] items-center overflow-clip relative shrink-0 w-[500px]" + className} data-name="Variant=MidMile">
        <div
          className="h-full relative shrink-0 w-[80px]"
          data-name="Timeine-container"
        >
          <div
            className="absolute h-[40px] left-0 overflow-clip top-0 w-[50px]"
            data-name="Timeline"
          >
            <div className="absolute left-1/2 size-[6px] top-[17px] translate-x-[-50%]">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 6 6"
              >
                <circle
                  cx="3"
                  cy="3"
                  fill="var(--fill-0, #C8C8C8)"
                  id="Ellipse 3"
                  r="3"
                />
              </svg>
            </div>
            <div
              className="absolute flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center left-1/2 top-0 translate-x-[-50%] w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]"
              style={
                {
                  "--transform-inner-width": "40",
                  "--transform-inner-height": "0",
                } as React.CSSProperties
              }
            >
              <div className="flex-none rotate-[270deg]">
                <div className="h-0 relative w-[40px]">
                  <div className="absolute inset-[-0.75px_-1.88%]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      height="1.5"
                      src={imgArrow1}
                      width="41.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="font-['Outfit:Medium',sans-serif] font-bold leading-[normal] relative shrink-0 text-lg text-black dark:text-white text-nowrap whitespace-pre">
          {format(new Date(date), 'MMM dd yyyy')}
        </p>
      </div>
    );
  }
  if (variant === "Mid") {
    return (
      <div className={"content-stretch flex h-[15px] items-center overflow-clip relative shrink-0 w-[500px]" + className} data-name="Variant=Mid">
        <div
          className="h-full relative shrink-0 w-[80px]"
          data-name="Timeine-container"
        >
          <div
            className="absolute box-border content-stretch flex flex-col h-[15px] items-start justify-center left-0 overflow-clip px-[25px] py-0 top-0 w-[50px]"
            data-name="Timeline"
          >
            <div
              className="basis-0 flex grow items-center justify-center min-h-px min-w-px relative shrink-0 w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]"
              style={
                {
                  "--transform-inner-width": "15",
                  "--transform-inner-height": "15",
                } as React.CSSProperties
              }
            >
              <div className="flex-none h-full rotate-[270deg]">
                <div className="h-full relative w-[15px]">
                  <div className="absolute inset-[-7.5%_-5%_92.5%_-5%]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      height="1.5"
                      src={imgArrow2}
                      width="16.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={"content-stretch flex h-[60px] items-center overflow-clip relative shrink-0 w-[500px]" + className} data-name="Variant=Top">
      <div
        className="h-full relative shrink-0 w-[80px]"
        data-name="Timeine-container"
      >
        <div
          className="absolute h-[40px] left-0 overflow-clip top-0 w-[50px]"
          data-name="Timeline"
        >
          <div className="absolute left-1/2 size-[6px] top-[17px] translate-x-[-50%]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 6 6"
            >
              <circle
                cx="3"
                cy="3"
                fill="var(--fill-0, #C8C8C8)"
                id="Ellipse 3"
                r="3"
              />
            </svg>
          </div>
          <div
            className="absolute bottom-0 flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center left-1/2 translate-x-[-50%] w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]"
            style={
              {
                "--transform-inner-width": "20",
                "--transform-inner-height": "0",
              } as React.CSSProperties
            }
          >
            <div className="flex-none rotate-[270deg]">
              <div className="h-0 relative w-[20px]">
                <div className="absolute inset-[-0.75px_-3.75%]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    height="1.5"
                    src={imgArrow3}
                    width="21.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="font-['Outfit:Medium',sans-serif] font-bold leading-[normal] relative shrink-0 text-lg text-black dark:text-white text-nowrap whitespace-pre">
        {format(new Date(date), 'MMM dd yyyy')}
      </p>
    </div>
  );
}

type EventProps = {
  className?: string;
  variant?: "Default" | "Ended";
  event: Event;
}

function EventCard({ className, variant = "Default", event }: EventProps) {

  const timeLine = () => {
    if (variant === "Default")
      return (
        <div
          className="absolute bottom-0 left-0 overflow-clip top-0 w-[50px]"
          data-name="Timeline"
        >
          <div
            className="absolute flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]"
          >
            <div className="flex-none rotate-[270deg]">
              <div className="h-0 relative w-[150px]">
                <div className="absolute inset-[-0.75px_-0.6%]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    height="1.5"
                    src={imgArrow4}
                  // width="125.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    return (
      <div
        className="absolute bottom-0 left-0 overflow-clip top-0 w-[50px]"
        data-name="Timeline"
      >
        <div
          className="absolute flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]"
        >
          <div className="flex-none rotate-[270deg]">
            <div className="h-0 relative w-[124px]">
              <div className="absolute inset-[-0.75px_-0.6%]">
                <img
                  alt=""
                  className="block max-w-none size-full"
                  height="1.5"
                  src={imgArrow5}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start min-h-px min-w-px overflow-clip relative shrink-0 " data-name="Vertical-Container">
      <div className="content-stretch flex h-[150px] items-start relative shrink-0 w-full">
        <div
          className="h-full relative shrink-0 w-[80px]"
          data-name="Timeine-container"
        >
          {timeLine()}
        </div>
        <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden transition cursor-pointer max-h-36 min-w-200 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md">
          <div className="flex">
            {/* Image */}
            <div className="w-46 h-36 bg-gray-200 flex-shrink-0">
              <img
                src={event.imageUrl || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {event.date} • {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {event.attendeesCount} attending
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default function EventTimeline() {
  return (
    <div className="px-8 py-6">
      <div className="max-w-4xl">
        <div className="">
          {FEATURED_EVENTS.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {/* {index !== events.length - 1 && (
                <div className="absolute left-6 top-20 w-0.5 h-20 bg-gray-200" />
              )} */}
              <TimelineTag variant={index === 0 ? "Top" : event.date === FEATURED_EVENTS[index - 1].date ? "Mid" : "MidMile"} date={event.date} />
              {/* Event card */}
              <EventCard event={event} variant={FEATURED_EVENTS.length === 1 ? "Ended" : "Default"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
