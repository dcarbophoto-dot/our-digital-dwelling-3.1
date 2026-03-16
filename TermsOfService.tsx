import React from 'react';

interface TermsOfServiceProps {
  onClose: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Terms of Service</h1>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Close Terms of Service"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="space-y-10 text-slate-600 dark:text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">1. Acceptance of Terms</h2>
            <p>
              By accessing and using "Our Digital Dwelling" (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the Service. These terms apply to all users, including real estate agents, homeowners, and developers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">2. Use of AI Content</h2>
            <p>
              Our Digital Dwelling utilizes artificial intelligence to generate virtual staging results. You acknowledge that these are digital visualizations and may not be 100% accurate to physical scale or architectural precision. Results are intended for illustrative purposes in marketing and should not be used for structural assessments, appraisals, or legal documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">3. User Content & Permissions</h2>
            <p>
              You represent and warrant that you own or have obtained all necessary licenses, rights, consents, and permissions to use and authorize the Service to use the photos you upload. You retain ownership of your original photos; however, by using the Service, you grant us a license to process these images to provide the staging results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">4. Real Estate Disclosures</h2>
            <p>
              When using virtually staged images for property listings, you agree to comply with all local real estate laws and board regulations regarding disclosures. It is your responsibility to clearly indicate that images have been virtually staged to avoid misleading potential buyers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">5. Limitation of Liability</h2>
            <p>
              Our Digital Dwelling shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or property value, resulting from your use of or inability to use the Service or any results generated therein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="pt-10 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm italic">Last Updated: May 2025</p>
            <button 
              onClick={onClose}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              I Understand & Agree
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;