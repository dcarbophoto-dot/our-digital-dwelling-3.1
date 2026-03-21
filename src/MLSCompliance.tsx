import React, { useEffect } from 'react';

interface MLSComplianceProps {
  onBack: () => void;
}

const MLSCompliance: React.FC<MLSComplianceProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto print:overflow-visible relative animate-in fade-in duration-300">
      <div className="sticky top-0 z-20 print:static print:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 print:border-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 print:hidden rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Virtual Staging and NAR/MLS Compliance</h1>
        </div>
        <button onClick={() => window.print()} className="print:hidden flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Save as PDF
        </button>
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

            <h3 className="text-2xl font-black mt-12 mb-6">Watermarks Are Required in the US</h3>
            <p>
              Applying a clear label like "Virtually Staged" or "Digitally Enhanced" is the most vital step in safely marketing AI-altered property photography. Doing so provides three essential safeguards:
            </p>
            <ol>
              <li>
                <strong>1. Federal Liability Defense</strong><br />
                The Federal Trade Commission (FTC) actively polices Truth in Advertising standards, forbidding any marketing that misrepresents reality. Presenting manipulated photography without a disclaimer is technically deceptive. A prominent watermark instantly neutralizes this liability.
              </li>
              <li>
                <strong>2. Fulfilling the NAR Standard of Practice</strong><br />
                Section 12 of the National Association of Realtors (NAR) ethical code mandates that agents offer an authentic visual representation in all promotional materials. NAR guidelines strictly dictate that any artificial modifications must be explicitly disclosed. Ignoring this rule triggers severe ethics violations at the state level.
              </li>
              <li>
                <strong>3. Staying Active on the MLS</strong><br />
                Virtually every regional MLS enforces strict regulations concerning digital editing. The standard criteria demand:
                <ul className="mt-2 list-disc list-inside marker:text-indigo-500">
                  <li>A prominent overlay text on all altered graphics</li>
                  <li>Detailed disclosures within the image caption</li>
                  <li>Public marketing remarks verifying the staging</li>
                  <li>Changes limited strictly to superficial cosmetics (furniture, lighting) with zero structural transformations</li>
                  <li>Ignoring these bylaws immediately risks heavy financial penalties, listing removal, or outright account bans.</li>
                </ul>
              </li>
            </ol>

            <h3 className="font-bold">4. Breakdown of the Law: Federal, State, and Local Mandates</h3>

            <h4>Federal Baseline: FTC Advertising Guidelines</h4>
            <p>While the FTC hasn't written a dedicated statute exclusively governing pixel manipulation in real estate, its overarching ban on deceptive commerce holds total jurisdiction. Any property graphic capable of deceiving a homebuyer breaches this standard. An unambiguous visual watermark remains the absolute best safeguard.</p>





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
              <li><strong>Built-In Watermark Tools:</strong> Our editor lets you add a text watermark directly onto your images before downloading. You can choose from several to maintain a professional look while meeting disclosure requirements.</li>

              <li><strong>Original Image Retention:</strong> We automatically retain your original source photos right alongside your newly enhanced designs. You have the ability to retrieve both files whenever necessary, streamlining your workflow when MLS boards mandate access to your original, property shots.</li>
            </ul>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 my-8">
              <h3 className="mt-0">A Quick Verification Checklist</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Prior to making any digitally enhanced property photo public, verify the following steps:</p>
              <ul className="list-none pl-0 space-y-2 text-sm font-medium">
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Watermark overlay applied directly to the image</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Watermark text is easily readable at final display size</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Photo caption clearly mentions digital staging</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Public property description includes staging disclosure</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Private agent remarks include staging disclosure</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Unedited source photos uploaded alongside staged copies</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> No permanent architectural elements removed or added</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Pre-existing property damage remains fully visible</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Window views reflect reality accurately</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Local and regional MLS bylaws reviewed</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> State-level real estate rules double-checked</li>
                <li className="flex items-center gap-2"><svg className="text-indigo-500 w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Brokerage compliance team consulted (if applicable)</li>
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
              Digital staging has revolutionized property marketing, enabling agents to cut staging expenses drastically while closing deals faster. However, this innovative capability demands strict transparency. Applying a compliance watermark isn't merely about satisfying state laws—it demonstrates your professional integrity, fosters immediate trust with prospective buyers, and shields your brand from liability. As legislative standards continue to tighten across the country, proactive disclosure is essential.
            </p>
            <p>
              Our Digital Dwelling removes the friction from these requirements. Simply upload your property images, apply your chosen staging style, select an appropriate watermark, and export your files securely. You maintain striking, high-end listings while ensuring your clients are fully informed and your business remains completely compliant.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MLSCompliance;
