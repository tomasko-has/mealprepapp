import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            ORA<span className="text-primary">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/menu" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Our Menu
            </Link>
            <Link
              href="/get-started"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
          <Link
            href="/get-started"
            className="md:hidden bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
