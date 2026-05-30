"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, RoleUpgradeModal } from "@/components/ui";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";
import { API_BASE_URL } from "@/lib/constants";
import FeaturedCoursesCarousel from "@/components/FeaturedCoursesCarousel";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const categories = [
    {
      name: "IT & Computing",
      courses: 312,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Engineering",
      courses: 245,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Medicine",
      courses: 189,
      color: "bg-green-100 text-green-700",
    },

    {
      name: "Business & Management",
      courses: 198,
      color: "bg-pink-100 text-pink-700",
    },
    {
      name: "Science",
      courses: 156,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "Arts & Humanities",
      courses: 134,
      color: "bg-indigo-100 text-indigo-700",
    },
  ];

  const stats = [
    { value: "10+", label: "Active Students" },
    { value: "5+", label: "Student Tutors" },
    { value: "3+", label: "Kuppi Sessions (Upcoming)" },
    { value: "-", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {/* <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-gray-900 mb-4">
              Popular University Faculties
            </h2>
            <p className="text-lg text-gray-600">
              Find kuppi sessions for your degree program
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                hover
                padding="md"
                className="text-center cursor-pointer group"
              >
                <div
                  className={`text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.courses} courses
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Courses Carousel */}
      <FeaturedCoursesCarousel />

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                📚
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">Learn from Peers</h3>
              <p className="text-gray-600 leading-relaxed">
                Access peer-led kuppi sessions created by fellow university
                students who've mastered the modules you're studying.
              </p>
              <Link
                href="/courses"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Browse Kuppis
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </Card>

            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🎓
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">Create Kuppi</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your knowledge with fellow students and earn while helping
                them ace their exams and assignments.
              </p>
              <Link
                href="/tutor/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Start Teaching
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </Card>

            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🛒
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">
                Academic Marketplace
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Buy and sell university essentials - calculators, drawing
                instruments, textbooks, electronics, and more.
              </p>
              <Link
                href="/marketplace"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Visit Marketplace
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="heading-2 mb-6">
            Ready to Ace Your University Exams?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join UniHub today and get access to peer-led kuppi sessions,
            simplified module guides, and connect with fellow Sri Lankan
            university students.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Join Free
                </Button>
              </Link>
            )}
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Browse Kuppi Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become Your Tutor Modal */}
      <RoleUpgradeModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        roleType="tutor"
        featureName="Create Kuppi"
      />
    </div>
  );
}
