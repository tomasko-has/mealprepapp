import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Tell Us Your Goals",
    description:
      "Take our quick quiz to share your health goals, dietary preferences, and any ingredients to avoid. We use this to personalize your menu.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Pick Your Plan",
    description:
      "Choose Standard for a curated selection at 20% off, or Flexible to hand-pick your own meals each week from our rotating menu of 14 options.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "We Cook, You Relax",
    description:
      "Our professional chefs prepare your meals fresh using locally sourced ingredients. No preservatives, no shortcuts — just real food.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Delivered 3x a Week",
    description:
      "Your meals arrive fresh on Sunday, Tuesday, and Thursday. Just heat and eat — each meal is ready in under 3 minutes.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "When do I need to select my meals?",
    a: "For Flexible plans, meal selection opens each week. If you don't select by the deadline, we'll send you our Standard curated selection.",
  },
  {
    q: "Can I skip a week?",
    a: "Not yet, but we're working on adding pause and skip functionality. You can cancel anytime from your account page.",
  },
  {
    q: "How do I heat my meals?",
    a: "Simply microwave for 2-3 minutes or heat in a pan for 5 minutes. Instructions are included with every meal.",
  },
  {
    q: "What if I have allergies?",
    a: "During signup, you can mark ingredients to avoid. Every meal lists full ingredients and allergen information.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-[#e8e8e4]">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Healthy Eating,<br />Made Simple
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            From choosing your plan to eating your first meal — here&apos;s
            everything you need to know.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col sm:flex-row gap-6 items-start ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : ""
                }`}
              >
                <div className="w-16 h-16 shrink-0 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <div className={i % 2 === 1 ? "sm:text-right" : ""}>
                  <span className="text-sm font-bold text-primary">{step.number}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans comparison */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Which Plan Is Right for You?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                Recommended
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Standard Plan</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                We curate your meals based on your preferences. No decisions
                needed — just open and eat.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  20% discount on all meals
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Auto-renewed weekly
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Zero decision fatigue
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-7">Flexible Plan</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Hand-pick your meals each week from our rotating menu. Full
                control over what you eat.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Choose from 14 meals weekly
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Duplicates allowed
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                  Change your picks every week
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-[#e8e8e4] rounded-2xl p-6"
              >
                <h3 className="text-base font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to eat better?
          </h2>
          <p className="mt-4 text-emerald-100 text-lg">
            Start your personalized meal plan in under 2 minutes.
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
