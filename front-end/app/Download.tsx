import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

const DownloadSection: React.FC = () => {
  return (
    <section id='download' className="py-24 px-6 relative border-t  transition-colors">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white transition-colors">Experience interest. everywhere.</h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors">Seamlessly sync your events across all your devices.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* iOS Card */}
        <div className="bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-3xl p-10 flex flex-col items-center text-center hover:border-gray-300 dark:hover:border-white/10 transition-colors group">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-none flex items-center justify-center mb-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors shadow-sm dark:shadow-none">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">iOS</h3>
          <p className="text-sm text-gray-500 mb-8">For iPhone and iPad</p>
          <button className="mt-auto bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
            Coming Soon
          </button>
        </div>

        {/* Android Card */}
        <div className="bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-3xl p-10 flex flex-col items-center text-center hover:border-gray-300 dark:hover:border-white/10 transition-colors group">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-none flex items-center justify-center mb-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors shadow-sm dark:shadow-none">
            <Smartphone size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Android</h3>
          <p className="text-sm text-gray-500 mb-8">Optimized for Android</p>
          <button className="mt-auto bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
            Coming Soon
          </button>
        </div>

        {/* Desktop Card */}
        <div className="bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-3xl p-10 flex flex-col items-center text-center hover:border-gray-300 dark:hover:border-white/10 transition-colors group">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-none flex items-center justify-center mb-6 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors shadow-sm dark:shadow-none">
            <Monitor size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Desktop</h3>
          <p className="text-sm text-gray-500 mb-8">macOS and Windows</p>
          <button className="mt-auto bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
            Coming Soon
          </button>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;