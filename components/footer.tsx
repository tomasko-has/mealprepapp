import Link from "next/link";

export default function Footer({ shopName = "ORA" }: { shopName?: string }) {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-bold text-white">
              ORA<span className="text-primary">N</span>utrition<span className="text-primary">.</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              Fresh, chef-prepared meals delivered to your door. Fuel your goals with zero effort.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/menu" className="hover:text-white transition-colors">Our Menu</Link>
              <Link href="/get-started" className="hover:text-white transition-colors">Get Started</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Delivery Schedule</h4>
            <div className="text-sm space-y-1">
              <p>Sunday - Mon & Tue meals</p>
              <p>Tuesday - Wed & Thu meals</p>
              <p>Thursday - Fri, Sat & Sun meals</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-center">
          &copy; {new Date().getFullYear()} {shopName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
