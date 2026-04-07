"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Badge } from "@/components/ui";
import Link from "next/link";

export default function HeroSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleCreateKuppi = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/auth/register");
      return;
    }

    if (user?.roles?.includes("tutor")) {
      router.push("/tutor/create-course");
    } else {
      router.push("/auth/register?role=tutor");
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="container-custom py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <Badge
                variant="secondary"
                className="mb-6 bg-white/10 text-white border border-white/20"
              >
                🎓 Sri Lanka's Peer-Learning Platform
              </Badge>

              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Master Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  University Modules
                </span>
              </h1>

              <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                Join thousands of university students learning through
                peer-to-peer kuppi sessions. Get expert guidance from fellow
                students who've already mastered your modules.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Learn from Peers</p>
                    <p className="text-sm text-gray-300">
                      Expert students sharing knowledge
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Ace Your Exams</p>
                    <p className="text-sm text-gray-300">
                      Real exam preparation
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Affordable</p>
                    <p className="text-sm text-gray-300">
                      Student-friendly pricing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-pink-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Build Your Career
                    </p>
                    <p className="text-sm text-gray-300">
                      Teach and earn as tutor
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Link href="/courses">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
                  >
                    Browse Kuppi Sessions
                  </Button>
                </Link>
                <button
                  onClick={handleCreateKuppi}
                  className="inline-flex items-center justify-center px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors border border-white/20 backdrop-blur-sm"
                >
                  Create Your Kuppi
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-sm text-gray-300 mb-4">
                  Trusted by students from:
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    "University of Colombo",
                    "University of Moratuwa",
                    "Colombo Medical College",
                  ].map((uni, i) => (
                    <div
                      key={i}
                      className="text-sm text-gray-400 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      {uni}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Visual Section */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main image card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 backdrop-blur-md border border-white/20 shadow-2xl">
                  <div className="aspect-square bg-gradient-to-br from-primary-400 to-blue-600 rounded-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=600&fit=crop&q=80"
                      alt="Students learning in Kuppi session"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600&fit=crop&q=80";
                      }}
                    />
                  </div>

                  {/* Floating stats cards */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                        👥
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">5K+</p>
                        <p className="text-sm text-gray-600">Active Students</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                        ⭐
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          4.8/5
                        </p>
                        <p className="text-sm text-gray-600">Avg. Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -z-10 inset-0">
                  <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-primary-400 opacity-20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 -right-20 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
