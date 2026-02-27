import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Notification } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function notificationTypeFilter(data: any) {
  var notif: Notification;

  if (data?.type === 'EVENT_REGISTERED') {
    notif = {
      id: data?.uuid,
      title: 'Ticket Confirmed',
      message: `You have successfully booked tickets for ${data?.body}`,
      time: '',
      isRead: data?.isRead || false,
      type: 'success'
    }
    return notif;
  }
}