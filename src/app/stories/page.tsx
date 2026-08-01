import Link from "next/link";

export const metadata = { title: "Learner Stories — UniHub" };

const STORIES = [
  {
    id: 1,
    name: "Kasun Perera",
    role: "Software Engineering Student, UoM",
    faculty: "Computing & IT",
    quote: "I started with the Python for Beginners course on UniHub while I was in my first semester. Six months later I landed a part-time internship at a startup in Colombo. The practical projects in the course gave me something real to show employers.",
    course: "Python for Beginners",
    outcome: "Internship at Colombo tech startup",
    rating: 5,
  },
  {
    id: 2,
    name: "Nimasha Fernando",
    role: "A/L Graduate",
    faculty: "Business",
    quote: "I used the boarding feature to find a room in Nugegoda before my first semester at NSBM. It saved me weeks of searching through Facebook groups and calling strangers. The room was exactly as advertised and the owner was verified.",
    course: "UniHub Boarding",
    outcome: "Found safe accommodation in 3 days",
    rating: 5,
  },
  {
    id: 3,
    name: "Tharaka Jayasinghe",
    role: "Civil Engineering Graduate, UoP",
    faculty: "Engineering",
    quote: "I was teaching privately but finding students was inconsistent. On UniHub I created a Structural Analysis course and within two months had 47 paying enrollments. It's now my main source of income while I look for full-time work.",
    course: "Structural Analysis Fundamentals",
    outcome: "47 enrollments, Rs 94,000 earned",
    rating: 5,
  },
  {
    id: 4,
    name: "Dilhara Rathnayake",
    role: "Medical Student, Faculty of Medicine Colombo",
    faculty: "Medicine",
    quote: "The Anatomy revision course was structured exactly like the way our lecturers test us. I went from borderline to top third in my end-of-year practical exam. I've now recommended it to everyone in my batch.",
    course: "Anatomy for Medical Students",
    outcome: "Top third in practical exam",
    rating: 5,
  },
  {
    id: 5,
    name: "Sachini Wickramasinghe",
    role: "Business Management Student, SLIIT",
    faculty: "Business",
    quote: "I needed a quick Digital Marketing certificate for a competition application. The course was well structured and I finished it in a weekend. I got accepted to the competition and the course gave me real concepts to speak to.",
    course: "Digital Marketing Fundamentals",
    outcome: "Competition acceptance",
    rating: 4,
  },
  {
    id: 6,
    name: "Ruwan Dissanayake",
    role: "Electronics & Telecom Graduate",
    faculty: "Engineering",
    quote: "Finding accommodation near the Moratuwa campus was always a nightmare. UniHub's boarding listings are organised by distance to university which made it so much faster. Moved in before lectures started.",
    course: "UniHub Boarding",
    outcome: "Room found near UoM in 2 days",
    rating: 5,
  },
];

const facultyColors: Record<string, string> = {
  "Computing & IT": "bg-blue-100 text-blue-800",
  "Engineering": "bg-orange-100 text-orange-800",
  "Business": "bg-purple-100 text-purple-800",
  "Medicine": "bg-red-100 text-red-800",
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i <= count ? "#f59e0b" : "#e5e7eb"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const STATS = [
  { value: "12,000+", label: "Active students" },
  { value: "300+", label: "Courses published" },
  { value: "4.7/5", label: "Average course rating" },
  { value: "Rs 2.4M+", label: "Earned by tutors" },
];

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <p className="text-sm text-green-700 font-medium mb-2">Real people. Real results.</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Learner Stories</h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Thousands of students across Sri Lanka have used UniHub to learn faster, find better accommodation,
            and build side income. Here are a few of their stories.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-green-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
                <div className="text-green-200 text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stories grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STORIES.map((story) => (
            <div key={story.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              {/* Quote */}
              <div className="text-3xl text-green-200 font-serif leading-none mb-3 select-none">"</div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-4">{story.quote}</p>

              {/* Outcome badge */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-green-600 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-green-800">{story.outcome}</span>
              </div>

              {/* Author */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{story.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{story.name}</p>
                  <p className="text-xs text-gray-500 truncate">{story.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars count={story.rating} />
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${facultyColors[story.faculty] ?? "bg-gray-100 text-gray-600"}`}>
                      {story.faculty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Start your own story</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Join thousands of students already learning, teaching, and finding accommodation on UniHub.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/courses" className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors">
              Browse courses
            </Link>
            <Link href="/auth/register" className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
