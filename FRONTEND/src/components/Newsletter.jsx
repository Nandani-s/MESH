import { useState } from 'react';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { ApiError } from '../api/client';
import { newsletterApi } from '../api/newsletter';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('subscribe');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const result = mode === 'subscribe'
        ? await newsletterApi.subscribe(email)
        : await newsletterApi.unsubscribe(email);
      setStatus('success');
      setMessage(result.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="newsletter" className="relative overflow-hidden border-y border-primary-100 bg-gradient-to-br from-rose-50 via-[#FFF9F6] to-pink-100">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:px-8 lg:py-16">
        <div className="max-w-xl text-center md:text-left">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            The MESH Edit
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            A little more style in your inbox.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            Be first to know about new arrivals, thoughtful style notes, and exclusive offers.
          </p>
        </div>

        <div className="w-full md:w-[min(100%,28rem)]">
          <form onSubmit={handleSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <div className="flex rounded-xl border border-rose-200 bg-white p-1.5 shadow-lg shadow-rose-900/5 focus-within:ring-2 focus-within:ring-primary-300">
              <span className="flex items-center pl-3 text-primary-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                id="newsletter-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus('idle');
                  setMessage('');
                }}
                placeholder="Your email address"
                required
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
              >
                {status === 'loading' ? 'Please wait' : mode === 'subscribe' ? 'Subscribe' : 'Unsubscribe'}
                {status !== 'loading' && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p aria-live="polite" className={`min-h-4 text-xs ${status === 'error' ? 'text-danger-600' : 'text-text-muted'}`}>
              {message || 'No spam. Unsubscribe whenever you like.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode((current) => current === 'subscribe' ? 'unsubscribe' : 'subscribe');
                setStatus('idle');
                setMessage('');
              }}
              className="text-xs font-semibold text-primary-700 underline decoration-primary-300 underline-offset-2 hover:text-primary-900"
            >
              {mode === 'subscribe' ? 'Already subscribed? Unsubscribe' : 'Want updates? Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
