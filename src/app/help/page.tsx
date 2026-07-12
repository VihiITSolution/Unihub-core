"use client";

import { useState } from "react";
import Link from "next/link";
import { ContactSupportButton } from "@/components/chat";
import { useAuth } from "@/contexts/AuthContext";
import { supportTicketService } from "@/services/supportTicket.service";

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_ATTACHMENT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const DESCRIPTION_MIN_LENGTH = 20;

const initialFormData = {
  subject: "",
  category: "",
  priority: "medium",
  description: "",
};

export default function HelpCenterPage() {
  const { token, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setMessage({
        type: "error",
        text: "Please log in to submit a support ticket.",
      });
      return;
    }

    if (!formData.subject.trim()) {
      setMessage({ type: "error", text: "Subject is required." });
      return;
    }
    if (!formData.category) {
      setMessage({ type: "error", text: "Please select a category." });
      return;
    }
    if (formData.description.trim().length < DESCRIPTION_MIN_LENGTH) {
      setMessage({
        type: "error",
        text: `Description must be at least ${DESCRIPTION_MIN_LENGTH} characters.`,
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await supportTicketService.createTicket(token, {
        ...formData,
        attachments,
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: response.message || "Ticket submitted successfully!",
        });
        setFormData(initialFormData);
        setAttachments([]);
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to submit ticket. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to submit ticket. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    const combined = [...attachments, ...files];
    if (combined.length > MAX_ATTACHMENTS) {
      setMessage({
        type: "error",
        text: `You can attach at most ${MAX_ATTACHMENTS} files.`,
      });
      return;
    }

    for (const file of files) {
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
        setMessage({
          type: "error",
          text: `${file.name}: only PNG, JPG, and PDF files are allowed.`,
        });
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        setMessage({
          type: "error",
          text: `${file.name}: files must be 10MB or smaller.`,
        });
        return;
      }
    }

    setMessage(null);
    setAttachments(combined);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            We&apos;re here to help! Submit a support ticket and our team will
            get back to you.
          </p>

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">
              Need help right now? Chat directly with our support team.
            </p>
            <ContactSupportButton />
          </div>
        </div>

        {/* Quick Help Links */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="#faq"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
            <p className="text-sm text-gray-600">
              Find answers to common questions
            </p>
          </Link>

          <Link
            href="#guides"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Guides
            </h3>
            <p className="text-sm text-gray-600">
              Step-by-step tutorials and guides
            </p>
          </Link>

          <Link
            href="#contact"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contact Us
            </h3>
            <p className="text-sm text-gray-600">
              Reach out to our support team
            </p>
          </Link>
        </div> */}

        {/* Support Ticket Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Support Ticket
            </h2>
            <p className="text-gray-600">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account & Billing</option>
                  <option value="course">Course Related</option>
                  <option value="enrollment">Enrollment Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Issue affecting usage</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="critical">Critical - System down</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or relevant information..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum 20 characters
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="attachments"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <input
                  type="file"
                  id="attachments"
                  name="attachments"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="attachments"
                  className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                >
                  Click to upload files
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, PDF up to 10MB (Max 5 files)
                </p>
              </div>
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {attachments.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-700 truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 font-medium ml-3"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Response Time
                  </h4>
                  <p className="text-sm text-gray-600">
                    We typically respond within 24-48 hours during business
                    days. Critical issues are prioritized and handled within a
                    few hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back to Home
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Help */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Live Chat Support
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Chat with our support team in real-time
                </p>
                <ContactSupportButton
                  label="Start Chat →"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Documentation
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Browse our comprehensive knowledge base
                </p>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View Docs →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
