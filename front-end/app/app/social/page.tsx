"use client";

import { Construction, UserIcon, Users } from "lucide-react";
import { useState } from "react";
import SocialProfile from "./SocialProfile";

export default function ProfilePage({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  const [socialTab, setSocialTab] = useState<"community" | "profile">(
    "community"
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="sticky top-0 z-[10] backdrop-blur-md pt-4 pb-2 px-6 flex justify-center">
        <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setSocialTab("community")}
            className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              socialTab === "community"
                ? "bg-white text-black shadow-sm dark:bg-[#121212] dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <Users size={16} /> Community
          </button>
          <button
            onClick={() => setSocialTab("profile")}
            className={`cursor-pointer flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              socialTab === "profile"
                ? "bg-white text-black shadow-sm dark:bg-[#121212] dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <UserIcon size={16} /> Profile
          </button>
        </div>
      </div>

      {socialTab === "community" ? (
        <div className="flex flex-col items-center justify-center py-40 px-6 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center mb-6 animate-bounce">
            <Construction size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Feature Under Development
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            We're currently building something amazing here. Please check back
            later for exciting new social features!
          </p>
          <div className="mt-8 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-brand-purple/30 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <SocialProfile isCurrentUser={true} onOpenSettings={onOpenSettings} />
      )}
    </div>
  );
}
