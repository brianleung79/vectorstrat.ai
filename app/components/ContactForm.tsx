'use client';

import { useState, FormEvent } from 'react';
import emailjs from '@emailjs/browser';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus('submitting');

    try {
      // Send email using EmailJS
      await emailjs.sendForm(
        'service_kvd1v9r',
        'template_d2f5vgo',
        e.currentTarget,
        'H3EYgg8SuEgjbnXSB'
      );

      setStatus('success');

      // Reset form after a short delay
      setTimeout(() => {
        e.currentTarget.reset();
      }, 100);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700/40">
      <h3 className="text-2xl font-bold text-gray-100 mb-6 text-center">Send a Message</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="from_name"
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="from_email"
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="What's this about?"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            placeholder="Tell me about your project or collaboration idea..."
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
        {status === 'success' && (
          <div className="p-4 bg-green-900/50 border border-green-600 rounded-lg text-green-300">
            Message sent successfully! I&apos;ll get back to you soon.
          </div>
        )}
        {status === 'error' && (
          <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
            Sorry, there was an error sending your message. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
