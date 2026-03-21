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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Virtual Staging and NAR/MLS Compliance</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 lg:p-12">
          
          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              Why <span className="text-indigo-600 dark:text-indigo-400">Watermarks</span> Matter
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">A Complete Guide to US Virtual Staging Compliance</p>
          </div>

          <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none prose-headings:font-black prose-h3:text-indigo-600 dark:prose-h3:text-indigo-400 prose-img:rounded-3xl prose-a:font-bold">
            <p className="text-lg leading-relaxed">
              Virtual staging is one of the most powerful tools in modern real estate marketing. However, in the United States, using virtually staged photos without proper disclosure can lead to severe MLS sanctions, ethics complaints, and expensive lawsuits. Learn exactly why "Virtually Staged" watermarks are legally required and how to protect your business.
            </p>

            <hr className="my-10 border-slate-200 dark:border-slate-800" />

            <h3>Why Watermarks Are Not Optional in the US</h3>
            <p>
              A watermark reading "Virtually Staged" or "Digitally Staged" is the single most important compliance measure you can take when using AI-enhanced real estate photos. It serves three critical purposes:
            </p>
            <ol>
              <li>
                <strong>Legal Protection Under Federal Law (FTC):</strong> The exact Truth in Advertising rules prevent any representations that are likely to mislead consumers. A virtually staged photo without disclosure can be considered deceptive advertising. 
              </li>
              <li>
                <strong>NAR Code of Ethics Compliance:</strong> Article 12 of the National Association of Realtors (NAR) Code of Ethics requires REALTORS to present a "true picture" in all advertising. Digitally modified images must be overtly disclosed.
              </li>
              <li>
                <strong>MLS Rules Enforcement:</strong> Nearly every MLS strictly enforces virtual staging rules requiring visible image watermarks, note disclosures in all public/agent remarks, and explicitly dictates that only superficial cosmetic changes (furniture, decor) are allowed—no structural changes.
              </li>
            </ol>

            <h3>What the Law Actually Says</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-10 not-prose">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-2">Federal (FTC)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">The FTC strictly prohibits deceptive advertising. An image that misleads a consumer about the condition of a property naturally falls under FTC jurisdiction.</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-black text-lg text-indigo-700 dark:text-indigo-300 mb-2">California (AB 723)</h4>
                <p className="text-sm text-indigo-900/70 dark:text-indigo-200">Effective Jan 1, 2026. The most comprehensive law in the country requires mandatory disclosure for any AI-modified image. Non-compliance risks major criminal penalties.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-2">Wisconsin (Act 69)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Effective 2027. Act 69 mandates the explicit disclosure of any technological modification to property photos across platforms.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-2">Texas & Florida</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">TREC and the Florida Division of Real Estate severely risk-manage deceptive staging. Major MLS networks (HAR, Stellar MLS, Miami MLS) enforce watermarks.</p>
              </div>
            </div>

            <h3>Real Enforcement Cases: The Risk of Skipping Watermarks</h3>
            <p>
              The cost of non-compliance widely eclipses the minor effort of adding a customized transparent watermark. Take these real-world enforcement scenarios:
            </p>
            <ul>
              <li><strong>MLS Fine and Listing Suspension:</strong> An agent in Southern California posted 12 virtually staged photos to CRMLS stripped of watermarks. Result: $1,500 fine and a 30-day listing suspension.</li>
              <li><strong>Ethics Settlement & License Review:</strong> An agent in Texas removed visible water damage from a ceiling via staging. Factoring in formal complaints filed to TREC, the agent paid $15,000 in settlement costs.</li>
              <li><strong>Buyer Lawsuit ($45,000):</strong> A buyer sued an agent in Florida after purchasing a condo where a closet was digitally removed to enlarge a bedroom visually. The settlement cost $45,000, and the brokerage lost its E&O insurance policies.</li>
            </ul>

            <h3>What You Must NOT Do</h3>
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30 text-red-900 dark:text-red-300 text-sm font-medium not-prose mb-10">
              <ul className="space-y-2 list-disc pl-5">
                <li><strong>No Structural Alterations:</strong> Never add, remove, or modify walls, windows, ceilings, or floors.</li>
                <li><strong>Do Not Hide Defects:</strong> Never cover cracks, mold, or existing water damage.</li>
                <li><strong>Do Not Manipulate Dimensions:</strong> Avoid warping or artificially widening rooms.</li>
                <li><strong>Do Not Add People:</strong> Adding specific demographics natively raises Fair Housing Act lawsuits.</li>
                <li><strong>Preserve Fixtures:</strong> Do not erase items structurally attached to the real estate viewings.</li>
              </ul>
            </div>

            <h3>How Lift My Place Keeps You Compliant</h3>
            <p>
              Lift My Place was structurally engineered inside the US legal framework. Through the <strong>Business Plan</strong>, our comprehensive export suite allows you to visually lock MLS-compliant custom <em>"Virtually Staged"</em> typography natively over all downloads. 
            </p>
            <p>
              We natively generate original side-by-sides, ensuring you easily maintain access to the unmodified physical layout and drastically slashing the multi-thousand dollar liabilities associated with modern digital real estate rendering.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MLSCompliance;
