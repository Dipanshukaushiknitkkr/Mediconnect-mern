import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  MessageSquare,
  Send,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Building2
} from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const ContactPage = () => {
  usePageMeta(
    'Contact & Support',
    'Get in touch with the MediConnect support team for technical help, inquiries, or physician accreditation.'
  );

  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Questions',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Thank you! Your message has been received.');
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full clinical-card border border-sky-500/20 text-sky-400 text-xs font-semibold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Get in Touch with MediConnect</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Contact & Support
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Have questions about video visits, doctor verification, or platform architecture? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="clinical-card p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
            
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">Message Sent Successfully</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out. We have received your inquiry and will respond to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', category: 'General Questions', subject: '', message: '' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-sky-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Send Us a Message</h2>
                  <p className="text-xs text-slate-400">Fill out the form below and our team will get back to you.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="General Questions">General Questions</option>
                      <option value="Technical Support">Technical Support / Video Call</option>
                      <option value="Doctor Registration">Doctor Registration & Verification</option>
                      <option value="Platform Feedback">Platform Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Question about appointment scheduling"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question or feedback in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl clinical-btn-primary font-bold text-white text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Side: Contact Info & Support Hours (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="clinical-card p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="text-base font-bold text-white">Direct Inquiries</h2>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Support Email</span>
                  <a href="mailto:support@mediconnect.com" className="text-white hover:text-sky-400 font-semibold transition-colors">
                    support@mediconnect.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Response Time</span>
                  <p className="text-white font-medium">Within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">For Medical Professionals</span>
                  <p className="text-white font-medium">Doctor credentialing and license verification support</p>
                </div>
              </div>
            </div>
          </div>

          <div className="clinical-card p-5 rounded-2xl border border-white/5 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold">
              <HelpCircle className="w-4 h-4" />
              <span>Looking for Quick Answers?</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Check our answers to questions about video calls, prescription validities, and slot management on our <Link to="/" className="text-sky-400 underline">Landing Page FAQ</Link>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ContactPage;
