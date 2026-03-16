import React from 'react';

interface UserGuideProps {
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4">
              <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Master Class</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">The Complete Guide to <br/>Virtual Staging</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">Everything you need to know to transform empty listings into sold properties using Our Digital Dwelling.</p>
          </div>
          <button 
            onClick={onClose}
            className="group p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
            aria-label="Close User Guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Quick Links / Table of Contents equivalent visually */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {['Getting Started', 'Interior Staging', 'Exterior Magic', 'Pro Tips'].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                    {item}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* Section 1: The Basics */}
            <section>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-600/20">1</span>
                Getting Started
              </h2>
              <div className="space-y-8 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-5">
                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Upload & Organize</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Drag and drop your high-resolution photos (JPG or PNG) directly onto the dashboard. You can group photos by property using the <strong>Create Project</strong> feature. This keeps your "123 Main St" listing separate from "456 Oak Ave".
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium"><strong>Photo Tip:</strong> Ensure your photos are horizontal (landscape) for the best results. Vertical photos work but may have tighter framing.</p>
                    </div>
                </div>
                
                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Understanding Credits</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Every action costs credits. Simple tasks like <strong>Add/Remove Object</strong> cost 1 credit. Full room staging (Modern, Luxury, etc.) costs 4 credits. High-end exterior transformations (Twilight, Seasons) cost 5 credits.
                    </p>
                </div>
              </div>
            </section>

            {/* Section 2: Interior Staging */}
            <section>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-600/20">2</span>
                Interior Staging Workflow
              </h2>
              <div className="space-y-8 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-5">
                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Step 1: Define the Space</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Select an image from the sidebar. Use the dropdown menus to tell the AI what it's looking at:
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-2 text-slate-600 dark:text-slate-400">
                        <li><strong>Image Type:</strong> Interior</li>
                        <li><strong>Staging Style:</strong> Choose the vibe (e.g., 'Modern' for city condos, 'Rustic' for country homes).</li>
                        <li><strong>Room Type:</strong> Critical! Telling the AI it's a "Bedroom" ensures it places a bed, not a dining table.</li>
                    </ul>
                </div>

                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Step 2: Generate & Review</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Click <strong>Generate</strong>. In about 10-15 seconds, your room will be furnished. Use the "Before/After" toggle at the top of the image to compare the transformation.
                    </p>
                </div>

                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Step 3: The "Empty Room" Trick</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Is the current room filled with old, ugly furniture? Don't try to stage over it.
                    </p>
                    <ol className="list-decimal ml-5 space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                        <li>Select the <strong>Empty Room</strong> style first.</li>
                        <li>Generate to clear the room.</li>
                        <li>Click <strong>Save Version</strong>.</li>
                        <li>Now, select your desired style (e.g., Modern) and generate <em>on top</em> of the empty version.</li>
                    </ol>
                </div>
              </div>
            </section>

            {/* Section 3: Exterior & Refinement */}
            <section>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-600/20">3</span>
                Exterior & Refinement
              </h2>
              <div className="space-y-8 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-5">
                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Curb Appeal Enhancers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Twilight Mode</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Turns day into dusk. Adds warmth to windows. Best for "Hero" shots.</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Lawn Replacement</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Fixes patchy grass instantly. Keeps original shadows for realism.</p>
                        </div>
                    </div>
                </div>

                <div className="relative pl-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Mastering Custom Refinement</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        The <strong>Custom Refinement</strong> box is your magic wand. You can talk to the AI to tweak the image.
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1">✓</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Good Prompt</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">"Add a large abstract painting with blue tones to the wall above the sofa."</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-1">✗</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Bad Prompt</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">"Make it look better" or "Add art." (Too vague)</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar Tips Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                Pro Tips
              </h3>
              <div className="space-y-8">
                <div>
                  <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Camera Height</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Photos taken at chest level (approx 4-5ft) produce better depth perception for furniture placement than photos taken too high or too low.</p>
                </div>
                <div>
                  <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Corner Shots</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Shooting from a corner into the room gives the AI more "floor" and "wall" context to place furniture accurately.</p>
                </div>
                <div>
                  <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Lighting</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Bright rooms stage better. If your photo is dark, use the refinement tool: <em>"Brighten the entire room and exposure"</em> before staging.</p>
                </div>
                <div>
                  <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">Batch Download</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Finished with a whole house? Select all the photos in the left sidebar and click <strong>Download Selected</strong> to get a single ZIP file.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-8 rounded-[2.5rem]">
                <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-100 mb-4">Still stuck?</h3>
                <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-6 leading-relaxed">
                    Our support team reviews difficult photos to help improve our AI models. Send us your tricky listing photo.
                </p>
                <a href="mailto:support@ourdigitaldwelling.com" className="block w-full text-center bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">Contact Support</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserGuide;