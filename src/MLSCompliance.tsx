import React, { useEffect } from 'react';

interface MLSComplianceProps {
  onBack: () => void;
}

const MLSCompliance: React.FC<MLSComplianceProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto relative animate-in fade-in duration-300">
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Virtual Staging and NAR/MLS Compliance</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 lg:p-12">

          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              NAR/MLS <span className="text-indigo-600 dark:text-indigo-400">Compliance</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">A guide to using Virtually Staged and Retouched images in your listings while staying compliant with NAR/MLS Regulations</p>
          </div>

          <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none prose-headings:font-black prose-h3:text-indigo-600 dark:prose-h3:text-indigo-400 prose-img:rounded-3xl prose-a:font-bold">
            <p className="text-lg leading-relaxed">
              Virtual staging is one of the most powerful tools in modern real estate marketing. But in the United States, using virtually staged photos without proper disclosure can lead to MLS sanctions, ethics complaints, and even lawsuits. This guide explains exactly what you need to know about watermarks and compliance.
            </p>

            <hr className="my-10 border-slate-200 dark:border-slate-800" />

            <h3>Watermarks Are Required in the US</h3>
            <p>
              A watermark reading "Virtually Staged" or "Digitally Staged" is the single most important compliance measure you can take when using AI-enhanced real estate photos. It serves three critical purposes:
            </p>
            <ol>
              <li>
                <strong>1. Legal Protection Under Federal Law</strong><br />
                The Federal Trade Commission (FTC) enforces Truth in Advertising rules that prohibit any representation likely to mislead consumers. A virtually staged photo without disclosure could be considered deceptive advertising. Adding a visible watermark is the clearest way to avoid this risk.
              </li>
              <li>
                <strong>2. NAR Code of Ethics Compliance</strong><br />
                Article 12 of the National Association of Realtors (NAR) Code of Ethics requires REALTORS to present a "true picture" in all advertising. The NAR has explicitly stated that digitally modified images must be disclosed. Failure to comply can result in ethics complaints filed with your state real estate commission.
              </li>
              <li>
                <strong>3. MLS Rules Enforcement</strong><br />
                Nearly every MLS in the country has specific rules about virtual staging. The vast majority require:
                <ul className="mt-2 list-disc list-inside marker:text-indigo-500">
                  <li>A visible watermark on each staged image</li>
                  <li>A mention in the photo caption</li>
                  <li>A note in both public and agent remarks</li>
                  <li>That only cosmetic changes are made (furniture, decor) with no structural alterations</li>
                  <li>Violating MLS rules can result in fines, temporary suspension from the platform, or permanent removal.</li>
                </ul>
              </li>
            </ol>

            <h3>What the Law Actually Says: Federal, State, and Local Requirements</h3>

            <h4>Federal Level: FTC Truth in Advertising</h4>
            <p>The FTC does not have a specific virtual staging law, but its general prohibition on deceptive advertising applies. Any image that could mislead a consumer about the condition of a property falls under FTC jurisdiction. A clear "Virtually Staged" watermark is the simplest defense.</p>





            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl my-6">
              <h4 className="mt-0 text-slate-900 dark:text-white">Best Practice: Provide Original Photos</h4>
              <p className="mb-0 text-sm">The gold standard is to include both the virtually staged version and the original, unmodified photo. This eliminates any ambiguity and builds buyer trust. California's AB 723 makes this mandatory with a link or QR code.</p>
            </div>



            <h3>What You Must NOT Do</h3>
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30 text-red-900 dark:text-red-300 text-sm font-medium not-prose mb-10">
              <p className="mb-2 text-base font-bold text-red-950 dark:text-red-200">Virtual staging should only involve cosmetic modifications. The following are prohibited:</p>
              <ul className="space-y-2 list-disc pl-5">
                <li><strong>Altering structural elements:</strong> Do not add, remove, or modify walls, windows, doors, ceilings, or floors.</li>
                <li><strong>Hiding defects:</strong> Do not cover up water damage, cracks, mold, or other property issues.</li>
                <li><strong>Changing dimensions:</strong> Do not make rooms appear larger or smaller than they are.</li>
                <li><strong>Adding people:</strong> Avoid inserting people into images, which can raise Fair Housing Act concerns if it suggests a preference for certain demographics.</li>
                <li><strong>Removing permanent fixtures:</strong> Do not digitally remove elements that are part of the property.</li>
                <li><strong>Altering the view:</strong> Do not modify what is visible through windows, such as removing neighboring buildings or adding landscaping that does not exist.</li>
                <li><strong>Changing flooring or materials:</strong> Do not replace hardwood with tile or paint over wallpaper digitally unless clearly disclosed as a renovation visualization.</li>
              </ul>
            </div>



            <h3 className="text-2xl font-black mt-12 mb-6">How Our Digital Dwelling Helps You Stay Compliant</h3>
            <ul>
              <li><strong>Built-In Watermark Tools:</strong> Our export editor lets you add a "Virtually Staged" text watermark directly onto your images before downloading. You can customize the position, size, font, and opacity to maintain a professional look while meeting disclosure requirements.</li>
              <li><strong>Compliance Notices for US Users:</strong> When you access Our Digital Dwelling from the US, you will see compliance reminders on your design pages.</li>
              <li><strong>Original Photo Preservation:</strong> We always preserve your original uploaded photos alongside the staged versions. You can download both at any time, making it easy to comply with requirements to provide unmodified images.</li>
            </ul>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 my-8">
              <h3 className="mt-0">A Simple Compliance Checklist</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Before publishing any virtually staged photo, run through this checklist:</p>
              <ul className="list-none pl-0 space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Watermark added ("Virtually Staged" visible on the image)</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Watermark is legible at the image size used in the listing</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Photo caption mentions virtual staging</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Public remarks include virtual staging disclosure</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Agent remarks include virtual staging disclosure</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Original photos are available (ideally published alongside staged versions)</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Only cosmetic changes were made (no structural alterations)</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> No property defects were hidden or obscured</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Views through windows have not been altered</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Local MLS rules have been checked and followed</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> State-specific requirements have been verified</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Brokerage compliance officer has reviewed (if applicable)</li>
              </ul>
            </div>

            <h3>Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <strong>Can I use a small, barely visible watermark to keep photos looking clean?</strong>
                <p>No. The watermark must be clearly legible when the image is displayed at standard listing size. A watermark that is too small to read does not constitute proper disclosure.</p>
              </div>
              <div>
                <strong>Do I need to watermark every single staged photo in a listing?</strong>
                <p>Yes. Each individually staged image needs its own watermark. A note in the listing remarks alone is not sufficient for most MLS systems.</p>
              </div>
              <div>
                <strong>What if I use virtual staging for social media but not the MLS listing?</strong>
                <p>FTC Truth in Advertising rules apply to all marketing channels, including social media, websites, and email campaigns. Watermarks are required regardless.</p>
              </div>
              <div>
                <strong>Does virtual staging count as material misrepresentation?</strong>
                <p>It can, if not properly disclosed. Undisclosed staging, or staging that hides defects or alters structural elements, constitutes material misrepresentation.</p>
              </div>
              <div>
                <strong>How should I handle virtual staging for international listings?</strong>
                <p>If your listing targets US buyers (published on US MLS systems or US-facing platforms), US disclosure rules apply regardless of the property's location.</p>
              </div>
            </div>

            <hr className="my-10 border-slate-200 dark:border-slate-800" />

            <h3 className="text-2xl font-black mt-12 mb-6">Conclusion</h3>
            <p>
              Virtual staging is a game-changer for real estate marketing, reducing costs by up to 97% compared to traditional staging while accelerating sales. But the power of this tool comes with a responsibility: transparency. Adding a "Virtually Staged" watermark is not just a legal requirement. It is a mark of professionalism that builds buyer trust and protects your business. With regulations evolving rapidly, especially with California leading the way, the standard is only going to get stricter.
            </p>
            <p>
              Our Digital Dwelling makes compliance simple. Upload your photo, generate your design, add your watermark, and publish with confidence. Your listings stay professional, your clients stay informed, and your business stays protected.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MLSCompliance;
