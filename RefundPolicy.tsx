import React from 'react';

interface RefundPolicyProps {
  onClose: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Refund & Dispute Policy</h1>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Close Refund Policy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="space-y-10 text-slate-600 dark:text-slate-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">1. Our Commitment</h2>
            <p>
              At Our Digital Dwelling, we strive to provide the highest quality virtual staging services powered by advanced AI. We understand that architectural visualization is subjective, and we are committed to your professional success.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">2. Satisfaction & Refinement</h2>
            <p>
              Instead of traditional refunds, we offer a robust "Custom Refinement" tool. If a generated image does not meet your expectations, we provide unlimited opportunities to refine the prompt, adjust furniture placement, or change styles until the desired result is achieved. Most quality issues are resolved within 1-2 refinement cycles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">3. Refund Eligibility</h2>
            <p>
              Refunds are issued on a case-by-case basis under the following specific conditions:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Verified technical failure: The service was unable to return any image result despite successful payment and valid photo upload.</li>
              <li>Duplicate billing: You were accidentally charged more than once for the same subscription or credit package.</li>
              <li>Unusable quality: Severe AI-generated architectural distortion that remains unusable after multiple refinement attempts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">4. Dispute Process</h2>
            <p>
              If you have a disagreement regarding a charge or service quality, please contact us at <span className="font-bold text-indigo-600 dark:text-indigo-400">disputes@ourdigitaldwelling.com</span> before initiating a chargeback with your bank. We aim to resolve all disputes amicably and within 48 business hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">5. Chargebacks</h2>
            <p>
              Unfounded chargebacks (disputing a charge that was validly authorized) may result in permanent suspension of your account and the removal of all staged photos from our servers to prevent unauthorized commercial use of the images.
            </p>
          </section>

          <section className="pt-10 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm italic">Last Updated: May 2025</p>
            <button 
              onClick={onClose}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              I Understand
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;