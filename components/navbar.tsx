import Link from "next/link";

export default function Navbar({ shopName = "ORA" }: { shopName?: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-2xl font-bold text-gray-900 shrink-0">
            ORA<span className="text-primary">N</span>utrition<span className="text-primary">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-0 h-full">
            <Link href="/menu" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              Weekly Menu
            </Link>
            <Link href="/get-started" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              Our Plans
            </Link>
            <Link href="/how-it-works" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              How It Works
            </Link>
            <Link href="/about" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              About Us
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold hover:border-gray-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/get-started"
              className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
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
