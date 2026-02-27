import React, { useContext, useState } from "react";
import {
  MapPin,
  Link as LinkIcon,
  Settings,
  Grid,
  Bookmark,
  User as UserIcon,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Search,
  Calendar,
  MapPin as MapPinIcon,
  Clock,
} from "lucide-react";
import { Event, UserProfile } from "@/lib/types";
import FollowListDialog from "@/components/dialogs/FollowListDialog";
import { MOCK_USERS } from "@/lib/services/mockData";
import { AuthContext } from "@/context/AuthContext";

interface SocialProfileProps {
  //   events: Event[];
  isCurrentUser: boolean;
  onOpenSettings?: () => void;
  //   onSelectEvent: (event: Event) => void;
}

type ProfileTab = "posts" | "saved" | "tagged";

const SocialProfile: React.FC<SocialProfileProps> = ({
  isCurrentUser,
  onOpenSettings,
}) => {
  const { user } = useContext(AuthContext);

  const [profileTab, setProfileTab] = useState<ProfileTab>("posts");

  // Follow Dialog State
  const [isFollowDialogOpen, setIsFollowDialogOpen] = useState(false);
  const [followDialogTitle, setFollowDialogTitle] = useState<
    "Followers" | "Following"
  >("Followers");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Filter events (mock logic: assuming 'events' passed are related to this user)

  const handleOpenFollow = (type: "Followers" | "Following") => {
    setFollowDialogTitle(type);
    setIsFollowDialogOpen(true);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto pt-4 px-4 pb-20 animate-in fade-in duration-500 z-[30]">
      {/* Search Bar for Finding People */}
      <div className="mb-8 relative max-w-md mx-auto md:max-w-full">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for people..."
          className="w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-full py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-purple outline-none dark:text-white shadow-sm"
        />
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-[#121212] rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-brand-purple to-blue-500 p-[3px]">
              <div className="w-full h-full rounded-full border-4 border-white dark:border-[#121212] bg-white dark:bg-[#121212] overflow-hidden">
                {user.avatarUrl && user.avatarUrl.length > 2 ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-white/10 text-3xl font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
            {/* Row 1: Username & Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  @{user.username.replace("@", "")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isCurrentUser ? (
                  <>
                    {/* <button
                      onClick={onOpenSettings}
                      className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-full text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={onOpenSettings}
                      className="p-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
                    >
                      <Settings size={20} />
                    </button> */}
                  </>
                ) : (
                  <button className="px-6 py-2 bg-brand-purple text-white rounded-full text-sm font-semibold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/30">
                    Follow
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto md:mx-0">
              {user.bio ||
                "Event Enthusiast. Exploring the world one ticket at a time."}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {user.location}
                  </span>
                )}
                <a
                  href="#"
                  className="flex items-center gap-1 text-brand-purple hover:underline"
                >
                  <LinkIcon size={12} /> interest.com/
                  {user.username.replace("@", "")}
                </a>
              </div>
            </div>

            {/* Row 2: Stats (Clickable) */}
            <div className="flex items-center justify-center md:justify-start gap-8 border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
              {/* <div className="text-center md:text-left">
                            <span className="block font-bold text-lg text-gray-900 dark:text-white">{userEvents.length}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Events</span>
                        </div> */}
              <button
                onClick={() => handleOpenFollow("Followers")}
                className="text-center md:text-left hover:opacity-70 transition-opacity group"
              >
                <span className="block font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-purple">
                  {user.followers || 128}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Followers
                </span>
              </button>
              <button
                onClick={() => handleOpenFollow("Following")}
                className="text-center md:text-left hover:opacity-70 transition-opacity group"
              >
                <span className="block font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-purple">
                  {user.following || 45}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Following
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-white/10 mb-6">
        <button
          onClick={() => setProfileTab("posts")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
            profileTab === "posts"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          Posts
          {profileTab === "posts" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setProfileTab("saved")}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
            profileTab === "saved"
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          Saved
          {profileTab === "saved" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
          )}
        </button>
      </div>

      {/* Content Area */}
      {/* {profileTab === 'posts' && (
            <div className="space-y-8">
                {userEvents.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <p>No events created yet.</p>
                    </div>
                ) : (
                    userEvents.map((event) => (
                        <div key={event.uuid} className="bg-white dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                             */}
      {/* Post Header */}
      {/* <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-white/10" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</span>
                                            <span className="text-xs text-gray-400">• 2h</span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Created an event</div>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div> */}

      {/* Caption (Optional) */}
      {/* <div className="px-4 pb-3">
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    Excited to announce our upcoming event! Tickets are selling out fast. 🔥 #{event.category}
                                </p>
                            </div> */}

      {/* Event Card (Embedded) */}
      {/* <div className="px-4 pb-2">
                                <div 
                                    onClick={() => onSelectEvent(event)}
                                    className="border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden cursor-pointer group/card"
                                >
                                    <div className="relative h-48 md:h-64 overflow-hidden">
                                        <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                                            {event.dateStr.split(' ')[0]} {event.dateStr.split(' ')[1]}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{event.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={12}/> {event.startTime}</span>
                                            <span className="flex items-center gap-1"><MapPinIcon size={12}/> {event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

      {/* Post Footer Actions */}
      {/* <div className="p-4 flex items-center gap-6">
                                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors group">
                                    <Heart size={20} className="group-hover:scale-110 transition-transform"/>
                                    <span className="text-sm font-medium">{event.isLiked ? 1 : 0}</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-purple transition-colors group">
                                    <MessageSquare size={20} className="group-hover:scale-110 transition-transform"/>
                                    <span className="text-sm font-medium">Comment</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-purple transition-colors ml-auto group">
                                    <Share2 size={20} className="group-hover:scale-110 transition-transform"/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )} */}

      {profileTab === "saved" && (
        <div className="py-20 text-center text-gray-400 text-sm">
          <div className="w-16 h-16 border-2 border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark size={32} strokeWidth={1} />
          </div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
            Saved Events
          </h3>
          <p>Events you save will appear here.</p>
        </div>
      )}

      {/* Dialogs */}
      <FollowListDialog
        isOpen={isFollowDialogOpen}
        onClose={() => setIsFollowDialogOpen(false)}
        title={followDialogTitle}
        users={MOCK_USERS} // Using mock users for demo
      />
    </div>
  );
};

export default SocialProfile;
