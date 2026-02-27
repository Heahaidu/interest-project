"use client";

import { useSearchParams } from "next/navigation";
import EventDetailDialog from "../dialogs/EventDetailDialog";
import { Event, UserProfile } from "@/lib/types";

interface EventDetailWrapperProps {
  currentUser: UserProfile | null;
  onToggleInterest: (id: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onRegisterEvent: (event: Event) => void;
  onUnregisterEvent: (event: Event) => void;
  onLogin: () => void;
}

export default function EventDetailWrapper(props: EventDetailWrapperProps) {
  const params = useSearchParams();
  const eventUuid = params.get('e');

  return <EventDetailDialog eventUuid={eventUuid} {...props} />;
}