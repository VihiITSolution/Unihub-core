import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">UniHub</h3>
            <p className="text-gray-400">
              Your comprehensive platform for online learning and marketplace solutions
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="text-gray-400 hover:text-white">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-400 hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Educators */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Educators</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tutor/dashboard" className="text-gray-400 hover:text-white">
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link href="/tutor/resources" className="text-gray-400 hover:text-white">
                  Teaching Resources
                </Link>
              </li>
              <li>
                <Link href="/tutor/support" className="text-gray-400 hover:text-white">
                  Tutor Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} UniHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
