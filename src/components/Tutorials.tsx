import React, { useState } from 'react';

interface TutorialsProps {
  onBack: () => void;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  embedUrl: string; // e.g., "https://www.youtube.com/embed/dQw4w9WgXcQ"
}

export const Tutorials: React.FC<TutorialsProps> = ({ onBack }) => {
  // HARDCODED TUTORIAL VIDEOS
  // Add new videos here by duplicating an object in this array:
  const [videos] = useState<VideoTutorial[]>([
    {
      id: "intro-video",
      title: "Getting Started with Virtual Staging",
      description: "Learn the basics of uploading a photo and staging your first room.",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // <-- Replace with your actual YouTube embed link
    },
    {
      id: "tutorial-2",
      title: "Season Change Tutorial",
      description: "Easily change the season of your Image using Our Digital Dwelling !",
      embedUrl: "https://www.youtube.com/embed/rVwMgrKDypY" // <-- Replace with your actual YouTube embed link
    },
    {
      id: "tutorial-3",
      title: "Empty the Room Tutorial",
      description: "Using the Empty the Room preset to Empty a Room with Our Digital Dwelling !",
      embedUrl: "https://www.youtube.com/embed/G5ZKESVEQmo" // <-- Replace with your actual YouTube embed link
    }
  ]);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Video Tutorials</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                Under Construction
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Learn to master the platform</p>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
        <div className="max-w-7xl mx-auto">

          {videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check back soon!</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">We are currently recording our training materials. Check back later for professional tutorials.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {videos.map(video => (
                <div key={video.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors hover:shadow-md">
                  <div className="aspect-video w-full bg-slate-900 relative">
                    <iframe
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    ></iframe>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{video.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
