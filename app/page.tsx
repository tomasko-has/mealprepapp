import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import MealPreview from "@/components/meal-preview";
import PlanCards from "@/components/plan-cards";
import Link from "next/link";
import ChatWidget from "@/components/chat-widget";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <MealPreview />
      <PlanCards />

      {/* CTA Banner */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to eat better?
          </h2>
          <p className="mt-4 text-emerald-100 text-lg">
            Join thousands who save time and hit their goals with ORA meals.
          </p>
          <Link
            href="/get-started"
            className="inline-block mt-8 bg-white text-primary px-8 py-3.5 rounded-full text-base font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started — 20% Off in Standard Plan
          </Link>
        </div>
      </section>

      <ChatWidget />
    </>
  );
}
