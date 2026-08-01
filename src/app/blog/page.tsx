"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

const POSTS = [
  {
    slug: "how-to-create-engaging-online-courses",
    category: "For Tutors",
    date: "July 28, 2026",
    title: "How to Create Engaging Online Courses That Students Actually Finish",
    excerpt: "Completion rates for online courses average around 13%. Here's how top UniHub tutors structure their content to keep students motivated from lesson one to the final exam.",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "best-universities-sri-lanka-2026",
    category: "Education",
    date: "July 21, 2026",
    title: "The Best Universities in Sri Lanka for 2026 — What Students Are Saying",
    excerpt: "We surveyed over 2,000 university students across Sri Lanka about their campus experience, job placement support, and course quality. Here are the results.",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "student-accommodation-guide",
    category: "Boarding",
    date: "July 14, 2026",
    title: "Finding Student Accommodation in Colombo: A Complete 2026 Guide",
    excerpt: "Whether you're looking for a room near UoM, SLIIT, or IIT, here's everything you need to know about pricing, neighbourhoods, and what to check before you sign.",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "online-learning-vs-campus",
    category: "Education",
    date: "July 7, 2026",
    title: "Online Learning vs. Campus Life — Which Is Right for You?",
    excerpt: "Both paths have clear advantages. We break down the real trade-offs for Sri Lankan students choosing between degree programmes and online upskilling in 2026.",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "top-skills-employers-want-2026",
    category: "Careers",
    date: "June 30, 2026",
    title: "Top 10 Skills Sri Lankan Employers Are Looking For in 2026",
    excerpt: "From data analysis to digital marketing, we analysed 50,000+ job postings to find out exactly what skills will get you hired — and which courses will help.",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "become-a-tutor-on-unihub",
    category: "For Tutors",
    date: "June 23, 2026",
    title: "How to Become a Tutor on UniHub and Earn Your First Rs 50,000",
    excerpt: "Over 300 tutors are already earning a consistent income on UniHub. Here's a practical step-by-step guide from application to your first paid enrollments.",
    readTime: "9 min read",
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  "For Tutors": "bg-purple-100 text-purple-800",
  "Education": "bg-blue-100 text-blue-800",
  "Boarding": "bg-orange-100 text-orange-800",
  "Careers": "bg-green-100 text-green-800",
};

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.alreadySubscribed ? "already" : "success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <span className="text-2xl">{status === "success" ? "🎉" : "✅"}</span>
        <p className="text-white font-semibold">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
          className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="px-5 py-2.5 bg-white text-green-700 font-semibold rounded-lg text-sm hover:bg-green-50 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-300 text-xs mt-3">{message}</p>
      )}
    </form>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-sm text-green-700 font-medium mb-1">UniHub Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Ideas, guides, and stories</h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Resources for students, tutors, and educators navigating learning and careers in Sri Lanka.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Featured post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 h-48 flex items-center justify-center">
            <span className="text-white text-6xl font-black opacity-10 select-none">BLOG</span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[featured.category]}`}>
                {featured.category}
              </span>
              <span className="text-xs text-gray-400">{featured.date} · {featured.readTime}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-snug">{featured.title}</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">{featured.excerpt}</p>
            <Link href="/wall" className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline">
              Read article →
            </Link>
          </div>
        </div>

        {/* Post grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <Link key={post.slug} href="/wall" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow no-underline">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 flex items-center justify-center">
                <span className="text-gray-300 text-3xl font-black select-none">U</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug flex-1">{post.title}</h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs font-semibold text-green-700">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-12 bg-green-700 rounded-xl p-6 sm:p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Stay in the loop</h2>
          <p className="text-green-200 mb-6 max-w-md mx-auto">
            Get the latest articles, guides, and course recommendations delivered to your inbox every week.
          </p>
          <NewsletterForm />
          <p className="text-green-300 text-xs mt-3">No spam. Unsubscribe any time.</p>
        </div>
      </div>
    </div>
  );
}
