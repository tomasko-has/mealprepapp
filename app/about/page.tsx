import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet ORA Nutrition — chef-prepared, macro-balanced meals made to take the stress out of eating well.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#e8e8e4]">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Fuel Your Life,<br />Not Your Stress
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            ORA Nutrition was born from a simple idea: eating well shouldn&apos;t
            be complicated. We prepare fresh, chef-crafted meals so you can focus
            on what matters — your goals, your time, your life.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe everyone deserves access to nutritious, delicious food
                without spending hours in the kitchen. Our team of professional
                chefs creates a rotating menu of 14 meals every week, using fresh,
                locally sourced ingredients.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you&apos;re looking to lose weight, build muscle, or simply
                save time — we&apos;ve got a plan that fits your lifestyle.
              </p>
            </div>
            <div className="bg-primary-light/30 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">14</div>
              <p className="text-gray-600 mb-6">new meals every week</p>
              <div className="text-5xl font-bold text-primary mb-2">3x</div>
              <p className="text-gray-600 mb-6">deliveries per week</p>
              <div className="text-5xl font-bold text-primary mb-2">0</div>
              <p className="text-gray-600">cooking required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fresh First</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Never frozen, never processed. Every meal is prepared fresh and
                delivered within hours of cooking.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Balanced Nutrition</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Every meal is designed with the right balance of protein, carbs,
                and healthy fats to fuel your day.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Save Time</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                No shopping, no cooking, no cleanup. Just heat, eat, and get on
                with your day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Delivery Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#e8e8e4] rounded-2xl p-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">Sunday</div>
              <p className="text-sm text-gray-500">Mon &amp; Tue meals</p>
            </div>
            <div className="bg-[#e8e8e4] rounded-2xl p-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">Tuesday</div>
              <p className="text-sm text-gray-500">Wed &amp; Thu meals</p>
            </div>
            <div className="bg-[#e8e8e4] rounded-2xl p-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">Thursday</div>
              <p className="text-sm text-gray-500">Fri, Sat &amp; Sun meals</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-emerald-100 text-lg">
            Choose your plan and start eating better this week.
          </p>
          <Link
            href="/get-started"
            className="inline-block mt-8 bg-white text-primary px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started — 20% Off First Week
          </Link>
        </div>
      </section>
    </div>
  );
}
