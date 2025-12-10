import Link from "next/link";

export default function Home() {
  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Welcome to UniHub
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your comprehensive platform for online learning and marketplace solutions
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/courses" className="btn-primary">
            Browse Courses
          </Link>
          <Link href="/marketplace" className="btn-secondary">
            Visit Marketplace
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Learn</h3>
          <p className="text-gray-600">
            Access high-quality courses from expert tutors
          </p>
          <Link href="/courses" className="text-primary-600 hover:underline mt-4 inline-block">
            Explore Courses →
          </Link>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold mb-2">Teach</h3>
          <p className="text-gray-600">
            Share your knowledge and create courses
          </p>
          <Link href="/tutor/dashboard" className="text-primary-600 hover:underline mt-4 inline-block">
            Become a Tutor →
          </Link>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">Shop</h3>
          <p className="text-gray-600">
            Buy and sell products in our marketplace
          </p>
          <Link href="/marketplace" className="text-primary-600 hover:underline mt-4 inline-block">
            Browse Products →
          </Link>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Courses</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Course Title {i}</h3>
              <p className="text-gray-600 mb-4">
                Learn essential skills from industry experts
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary-600">$99</span>
                <Link href={`/courses/${i}`} className="btn-primary">
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
