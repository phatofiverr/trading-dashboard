import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../Button"

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  buttonText: string
  isFree?: boolean
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individual traders getting started with journaling. No credit card required, no funny business! 🎯",
    features: [
      "Unlimited trades (yes, really!)",
      "Advanced analytics & reports", 
      "Risk management tools",
      "Strategy backtesting",
      "Calendar integration",
      "Priority support",
      "CSV export",
      "Trade journal & notes"
    ],
    buttonText: "Get Started - It's Free! 🚀",
    isFree: true
  },
  {
    name: "Pro",
    price: "Free",
    description: "Advanced features for serious traders who want detailed insights. Still free because we're nice like that! 😎",
    features: [
      "Unlimited trades (yes, really!)",
      "Advanced analytics & reports", 
      "Risk management tools",
      "Strategy backtesting",
      "Calendar integration",
      "Priority support",
      "CSV export",
      "Trade journal & notes"
    ],
    isPopular: true,
    buttonText: "Start 14-day trial (of free stuff!) 🎉",
    isFree: true
  },
  {
    name: "MAX",
    price: "5",
    description: "Basically, if you just feel like donating us some money 💰",
    features: [
      "Everything in Pro (still free!)",
      "Team collaboration",
      "Multi-account management",
      "Custom reporting",
      "API access",
      "Dedicated support",
      "Unlimited trades (yes, really!)",
      "Advanced analytics & reports"
    ],
    buttonText: "Contact (if you really wanna pay) 😅"
  }
]

export function PricingSection() {
  const navigate = useNavigate()

  const handleButtonClick = (plan: Plan) => {
    if (plan.buttonText.includes("Contact")) {
      // For contact buttons, you might want to open a contact form or email
      window.location.href = "https://discord.gg/4k29rppuhw"
    } else {
      // For Get Started buttons, navigate to register page
      navigate('/register')
    }
  }

  return (
    <section id="pricing" className="py-20 px-4 xl:px-0">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold tracking-tighter text-white mb-4">
            Simple, transparent pricing (mostly free!)
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your trading journey. 
          </p>
        </div>

        {/* Pricing Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 max-w-10xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className="relative p-8 bg-gradient-to-br from-[#141515] to-[#0A0A0A] rounded-lg"
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">
                    {plan.price === "Free" ? "$0" : `$${plan.price}`}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">per user</span>
                </div>
                <div className="text-sm text-gray-400 mb-6">per month</div>
                <p className="text-gray-300 text-base leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <Button onClick={() => handleButtonClick(plan)} className="w-full bg-[#818CF8] hover:bg-indigo-600 text-white">
                  {plan.buttonText.includes("Contact") ? "Contact Us" : plan.buttonText.includes("trial") ? "Get Started" : "Get started"}
                </Button>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-1">
            Need a custom solution? We work with trading firms of all sizes. 
          </p>
          <p className="text-gray-300 mb-4">
          But honestly, just use the free plan!
          </p>
          
        </div>
      </div>
    </section>
  )
}

export default PricingSection