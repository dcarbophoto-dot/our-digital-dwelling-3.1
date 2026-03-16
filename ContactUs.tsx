import React from 'react';

interface ContactUsProps {
  onClose: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Contact Us</h1>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Close Contact Us"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">Customer Support</h2>
              <p className="mb-4">
                Need help with a project or have questions about our staging styles? Our support team is available Monday through Friday, 9am - 6pm EST.
              </p>
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                <a href="mailto:support@ourdigitaldwelling.com">support@ourdigitaldwelling.com</a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">Enterprise & Partnerships</h2>
              <p className="mb-4">
                Interested in volume licensing for your entire brokerage or enterprise API access?
              </p>
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <a href="mailto:partners@ourdigitaldwelling.com">partners@ourdigitaldwelling.com</a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-sm">Connect with us</h2>
              <p className="mb-4">Follow us for staging tips and property visualization trends.</p>
              <div className="flex gap-4">
                <a href="https://instagram.com/ourdigitaldwelling" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com/ourdigitaldwelling" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </section>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Our Headquarters</h2>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Office Address</p>
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Our Digital Dwelling Inc.<br />
                  123 Visualization Way, Suite 400<br />
                  New York, NY 10013
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Legal Inquiries</p>
                <p className="text-sm">For DMCA notices or legal documentation, please contact our legal department at <span className="font-bold text-indigo-600 dark:text-indigo-400">legal@ourdigitaldwelling.com</span>.</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={onClose}
                className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                Return to Site
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;