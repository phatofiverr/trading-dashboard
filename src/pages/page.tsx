import { CallToAction } from "@/components/ui/CallToAction"
import FeatureDivider from "@/components/ui/FeatureDivider"
import Features from "@/components/ui/Features"
import { Hero } from "@/components/ui/Hero"
import { Map } from "@/components/ui/Map/Map"
import { SolarAnalytics } from "@/components/ui/SolarAnalytics"
import Testimonial from "@/components/ui/Testimonial"
import { NavBar } from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import PricingSection from "@/components/ui/PricingSection"

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-[#141515] to-[#0A0A0A] antialiased selection:bg-white/20 selection:text-white min-h-screen flex flex-col">
      <NavBar />
      <main className="relative mx-auto flex flex-col flex-grow">
        <div className="pt-10">
          <Hero />
        </div>

        <div className="mt-52 px-4 xl:px-0">
          <Features />
        </div>
        
        <div className="mt-32">
          <PricingSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
