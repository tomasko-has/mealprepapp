import Link from "next/link";

const CHECK = (
  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export default function PlanCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Two ways to enjoy chef-prepared meals every week
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Standard Plan */}
          <Link
            href="/get-started"
            className="relative pt-12 p-10 rounded-3xl border-[3px] border-primary bg-primary-light/20 hover:shadow-xl transition-all group"
          >
            <span className="absolute top-5 left-10 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">
              Recommended
            </span>
            <div className="w-12 h-12 mb-5 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              Standard Plan
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Pre-selected meals optimized for your goals and preferences. No decisions needed — just heat and eat.
            </p>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              <li className="flex items-center gap-2.5">{CHECK} No decision fatigue</li>
              <li className="flex items-center gap-2.5">{CHECK} Auto-renewed weekly</li>
              <li className="flex items-center gap-2.5">{CHECK} 20% discount on all meals</li>
              <li className="flex items-center gap-2.5">{CHECK} Matched to your dietary preferences</li>
            </ul>
            <span className="inline-block w-full text-center bg-primary text-white py-3.5 rounded-full text-sm font-semibold group-hover:bg-primary-dark transition-colors">
              Get Started
            </span>
          </Link>

          {/* Flexible Plan */}
          <Link
            href="/get-started"
            className="pt-12 p-10 rounded-3xl border-[3px] border-gray-200 bg-white hover:border-primary hover:shadow-xl transition-all group"
          >
            <div className="w-12 h-12 mb-5 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              Flexible Plan
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6">
              Pick your own meals each week from our rotating menu of 14 options. Full control over what you eat.
            </p>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              <li className="flex items-center gap-2.5">{CHECK} Full meal control</li>
              <li className="flex items-center gap-2.5">{CHECK} Choose from 14 meals weekly</li>
              <li className="flex items-center gap-2.5">{CHECK} Pick duplicates allowed</li>
              <li className="flex items-center gap-2.5">{CHECK} Change meals anytime before cutoff</li>
            </ul>
            <span className="inline-block w-full text-center bg-primary text-white py-3.5 rounded-full text-sm font-semibold group-hover:bg-primary-dark transition-colors">
              Get Started
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
