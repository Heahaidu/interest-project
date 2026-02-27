"use client";

import { useContext, useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Modal from "@/components/common/Modal";
import AuthModal from "@/components/common/AuthModal";
import Sidebar from "@/app/app/Sidebar";
import { AppPage, Event as EventType } from "@/lib/types";
import Footer from "./Footer";
import { Menu } from "lucide-react";
import { eventApi } from "@/lib/api/event";
import SettingsDialog from "@/components/dialogs/SettingsDialog";
import AiChatWidget from "@/components/shared/AiChatWidget";
import EventDetailDialog from "@/components/dialogs/EventDetailDialog";
import EventEditorDialog from "@/components/dialogs/EventEditorDialog";
import { AuthContext } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useContext(AuthContext);
  const params = useSearchParams();
  const eventUuid = params.get("e");

  const [currentTitle, setCurrentTitle] = useState("Discover");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorEvent, setEditorEvent] = useState<EventType | null>(null);
  const [currentPage, setCurrentPage] = useState<AppPage>("Discover");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openCreateDialog = () => {
    setEditorEvent(null);
    setIsEditorOpen(true);
  };

  const handleRegisterEvent = (event: EventType) => {
    const updatedEvent = { ...event, isRegistered: true };
    setEvents((prev) =>
      prev.map((e) => (e.uuid === event.uuid ? updatedEvent : e))
    );
    setSelectedEvent(updatedEvent);
  };

  const handleUnregisterEvent = (event: EventType) => {
    if (confirm("Are you sure you want to cancel your registration?")) {
      const updatedEvent = { ...event, isRegistered: false };
      setEvents((prev) =>
        prev.map((e) => (e.uuid === event.uuid ? updatedEvent : e))
      );
      setSelectedEvent(updatedEvent);
    }
  };

  const openEditDialog = (event: EventType) => {
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

  const handleCreateEvent = (newEvent: EventType) => {
    setEvents((prev) => [newEvent, ...prev]);
    setIsEditorOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: EventType) => {
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
    } else {
      setAuthMode("login");
      setShowAuthModal(true);
    }
  };

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { items } = await eventApi.list();
    setEvents(items);
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#050505] transition-colors duration-200">
      {/* Sidebar - Desktop */}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <Menu />
      </button>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Header */}
        <Header
          title={currentTitle}
          onNavigate={(label: string) => setCurrentTitle(label)}
          onOpenSetting={handleOpenSetting}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />

        {/* Main Content with proper spacing */}
        <main className="flex-1 w-full animate-in fade-in duration-300 slide-in-from-bottom-2">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>

        {/* Footer - Sticky bottom */}
        <Footer />
      </div>

      {/* Auth Modal - Combined Login/Register */}
      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <AuthModal
          initialMode={authMode}
          onSuccess={() => setShowAuthModal(false)}
        />
      </Modal>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* AI Chat Widget */}
      <AiChatWidget allEvents={events} onEventClick={setSelectedEvent} />

      {/* Event Detail Dialog */}
      <EventDetailDialog
        eventUuid={eventUuid}
        currentUser={user}
        onToggleInterest={handleToggleInterest}
        onEdit={openEditDialog}
        onDelete={handleDeleteEvent}
        onRegisterEvent={handleRegisterEvent}
        onUnregisterEvent={handleUnregisterEvent}
        onLogin={handleLogin}
      />

      {/* Event Editor Dialog */}
      <EventEditorDialog
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        event={editorEvent}
        onSave={editorEvent ? handleUpdateEvent : handleCreateEvent}
      />
    </div>
  );
}