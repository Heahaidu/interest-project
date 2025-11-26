import { INITIAL_NOTIFICATIONS } from "@/lib/constants";
import { Notification } from "@/lib/types";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Notificator() {
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const handleMarkAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
          }

        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    return (
        <div className="relative" ref={notifRef}>
            <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                )}
            </button>

            {isNotifOpen && (
                <div className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllNotificationsRead} className="text-xs text-brand-purple hover:text-purple-600 font-medium">Mark all read</button>
                        )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div onClick={() => setNotifications(prevNotis => prevNotis.map(n => n.id === notif.id? {...n, isRead: true}: n))} key={notif.id} className={`p-4 border-b border-gray-100 dark:border-white/5 last:border-none hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{notif.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{notif.message}</p>
                                            <span className="text-[10px] text-gray-400 mt-2 block">{notif.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-white/5 text-center">
                        <button className="text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">View All History</button>
                    </div>
                </div>
            )}
        </div>
    )
}