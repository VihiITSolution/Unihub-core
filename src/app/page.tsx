import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";

export default function Home() {
  const categories = [
    {
      name: "Web Development",
      icon: "💻",
      courses: 1234,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Data Science",
      icon: "📊",
      courses: 892,
      color: "bg-green-100 text-green-700",
    },
    {
      name: "Business",
      icon: "💼",
      courses: 756,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Design",
      icon: "🎨",
      courses: 634,
      color: "bg-pink-100 text-pink-700",
    },
    {
      name: "Marketing",
      icon: "📈",
      courses: 521,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "Photography",
      icon: "📷",
      courses: 412,
      color: "bg-indigo-100 text-indigo-700",
    },
  ];

  const featuredCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      instructor: "John Doe",
      price: 49.99,
      originalPrice: 89.99,
      rating: 4.8,
      students: 12450,
      image: "https://via.placeholder.com/400x250",
      level: "Beginner",
      bestseller: true,
    },
    {
      id: 2,
      title: "Advanced Python Programming",
      instructor: "Jane Smith",
      price: 39.99,
      rating: 4.9,
      students: 8934,
      image: "https://via.placeholder.com/400x250",
      level: "Advanced",
      bestseller: false,
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      instructor: "Mike Johnson",
      price: 59.99,
      originalPrice: 99.99,
      rating: 4.7,
      students: 6721,
      image: "https://via.placeholder.com/400x250",
      level: "Intermediate",
      bestseller: true,
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "10K+", label: "Expert Tutors" },
    { value: "100K+", label: "Total Courses" },
    { value: "4.8/5", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="primary" className="mb-6">
                🎉 Over 50,000 Students Learning
              </Badge>
              <h1 className="heading-1 text-gray-900 mb-6">
                Learn Without Limits, Grow Without Boundaries
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of learners worldwide. Access expert-led courses,
                connect with a thriving community, and transform your future
                with UniHub.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/courses">
                  <Button variant="primary" size="lg" icon="🚀">
                    Start Learning
                  </Button>
                </Link>
                <Link href="/tutor/dashboard">
                  <Button variant="outline" size="lg" icon="🎓">
                    Become a Tutor
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-8 flex-wrap">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 text-lg mb-1">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Trusted by 50,000+ learners
                  </p>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative z-10">
                <img
                  src="https://via.placeholder.com/600x500"
                  alt="Learning"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold">Course Completed!</p>
                    <p className="text-sm text-gray-600">Web Development</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-gray-900 mb-4">
              Explore Top Categories
            </h2>
            <p className="text-lg text-gray-600">
              Discover courses in the most popular fields
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
      </section>

      {/* Featured Courses */}
      <section className="section">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="heading-2 text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-600">Hand-picked courses for you</p>
            </div>
            <Link href="/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} hover padding="sm" className="group">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  {course.bestseller && (
                    <Badge variant="warning" className="absolute top-3 left-3">
                      ⭐ Bestseller
                    </Badge>
                  )}
                  <Badge
                    variant="gray"
                    className="absolute top-3 right-3 bg-white"
                  >
                    {course.level}
                  </Badge>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {course.instructor}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-yellow-500">
                      {course.rating}
                    </span>
                    <div className="flex text-yellow-500 text-sm">
                      {"★".repeat(Math.floor(course.rating))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({course.students.toLocaleString()})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link href={`/courses`}>
                      <Button variant="primary" size="sm">
                        Enroll
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                📚
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">Learn</h3>
              <p className="text-gray-600 leading-relaxed">
                Access high-quality courses from expert tutors across multiple
                disciplines and skill levels.
              </p>
              <Link
                href="/courses"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Explore Courses
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
              <h3 className="heading-4 text-gray-900 mb-3">Teach</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your expertise with thousands of students worldwide and
                earn while making an impact.
              </p>
              <Link
                href="/tutor/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Become a Tutor
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
              <h3 className="heading-4 text-gray-900 mb-3">Shop</h3>
              <p className="text-gray-600 leading-relaxed">
                Buy and sell educational resources, books, and materials in our
                trusted marketplace.
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
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join UniHub today and get access to thousands of courses, expert
            instructors, and a global community of learners.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">

            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
