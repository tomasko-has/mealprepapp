import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80')",
        }}
      />
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-xl">
          <span className="inline-block bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Get 20% off your first week
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Eat Fresh.{" "}
            <span className="text-primary">Fuel Right.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-md">
            Chef-prepared, macro-balanced meals delivered 3x a week. No cooking, no cleanup, no compromise.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="bg-primary text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-primary-dark transition-colors text-center"
            >
              Get Started
            </Link>
            <a
              href="#menu"
              className="border border-white/30 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/10 transition-colors text-center"
            >
              View Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
