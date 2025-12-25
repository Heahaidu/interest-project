"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Header from "@/components/common/Header";
import { Modal } from "@/components/common/Modal";
import Login from "@/components/common/Login";
import Register from "@/components/common/Register";
import Sidebar from "@/app/app/Sidebar";
import {
  AppPage,
  Event,
} from "@/lib/types";
import Footer from "./Footer";
import { Menu } from "lucide-react";
import { eventApi } from "@/lib/api/event";
import SettingsDialog from "@/components/dialogs/SettingsDialog";
import AiChatWidget from "@/components/shared/AiChatWidget";
import EventDetailDialog from "@/components/dialogs/EventDetailDialog";
import EventEditorDialog from "@/components/dialogs/EventEditorDialog";
import { AuthContext } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function AppLayout({children}: {children: React.ReactNode}) {
  const { user } = useContext(AuthContext);

  // -- Filters State --
  const [currentTitle, setCurrentTitle] = useState("Discover");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorEvent, setEditorEvent] = useState<Event | null>(null);

  // conditional rendering page
  const [currentPage, setCurrentPage] = useState<AppPage>("Discover");

  const params = useSearchParams();
  const eventUuid = params.get('e');

  // --- Handlers ---
  const openCreateDialog = () => {
    setEditorEvent(null);
    setIsEditorOpen(true);
  };
  // Refs for clicking outside dropdowns
  const moreCatRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  // auth modals
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleRegisterEvent = (event: Event) => {
    const updatedEvent = { ...event, isRegistered: true };
    setEvents((prev) =>
      prev.map((e) => (e.uuid === event.uuid ? updatedEvent : e))
    );
    setSelectedEvent(updatedEvent);

  };

  const handleUnregisterEvent = (event: Event) => {
    if (confirm("Are you sure you want to cancel your registration?")) {
      const updatedEvent = { ...event, isRegistered: false };
      setEvents((prev) =>
        prev.map((e) => (e.uuid === event.uuid ? updatedEvent : e))
      );
      setSelectedEvent(updatedEvent);
    }
  };

  const openEditDialog = (event: Event) => {
    if (event.isEnded) {
      alert("Cannot edit past events.");
      return;
    }
    setEditorEvent(event);
    setIsEditorOpen(true);
  };

  const handleToggleInterest = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.uuid === id ? { ...e, isLiked: !e.isLiked } : e))
    );
    if (selectedEvent && selectedEvent.uuid === id) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, isLiked: !prev.isLiked } : null
      );
    }
  };

  // CRUD OPERATIONS
  const handleCreateEvent = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev]);
    setIsEditorOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((e) => (e.uuid === updatedEvent.uuid ? updatedEvent : e))
    );
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents((prev) => prev.filter((e) => e.uuid !== id));
      setSelectedEvent(null);
    }
  };

  const handleOpenSetting = () => {
    if (user) {
      setIsSettingsOpen(true);
    } else setShowSignInModal(true);
  };

  useEffect(() => {
    load();
  }, []);

  // API
  async function load() {
    const { items, nextCursor, hasNext } = await eventApi.list();
    setEvents(items);
  };

  const filteredEvents = events;

  return (
    <div className="flex min-h-screen bg-white min-h-screen bg-white dark:bg-[#050505] transition-all duration-200">
      <Sidebar
        active={currentPage}
        onNavChange={(label) => {
          setCurrentTitle(label);
          setCurrentPage(label);
        }}
        onCreateEvent={openCreateDialog}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSettings={handleOpenSetting}
      />
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <Menu />
      </button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-56 min-h-screen dark:!bg-[#0a0a0a]">
        {/* Header - Fixed on top */}
        <Header
          title={currentTitle}
          onNavigate={(label: string) => {
            setCurrentTitle(label);
          }}
          onOpenSetting={() => setIsSettingsOpen(true)}
          onLogin={() => setShowSignInModal(true)}
          onRegister={() => setShowSignUpModal(true)}
        />

        {/* Main content */}
        <main className="flex-1 animate-in fade-in duration-300 slide-in-from-bottom-2">
          {children}
        </main>
        <Footer />
      </div>
      <Modal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)}>
        <Login onSuccess={() => setShowSignInModal(false)} />
      </Modal>

      <Modal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)}>
        <Register onSuccess={() => setShowSignUpModal(false)} />
      </Modal>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AiChatWidget allEvents={events} onEventClick={setSelectedEvent} />

      <EventDetailDialog
        eventUuid={eventUuid}
        currentUser={user}
        onToggleInterest={handleToggleInterest}
        onEdit={openEditDialog}
        onDelete={handleDeleteEvent}
        onRegisterEvent={handleRegisterEvent}
        onUnregisterEvent={handleUnregisterEvent}
        onLogin={() => {
          setSelectedEvent(null);
          setShowSignInModal(true);
        }}
      />
      <EventEditorDialog
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        event={editorEvent}
        onSave={editorEvent ? handleUpdateEvent : handleCreateEvent}
      />
    </div>
  );
}
