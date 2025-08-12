import useScroll from "@/lib/useScroll"
import { cx } from "@/lib/utils"
import { RiCloseFill, RiMenuFill } from "@remixicon/react"
import React from "react"
import { useNavigate } from "react-router-dom"
// import { SolarLogo } from "../../../public/SolarLogo"
import { Button } from "../Button"

export function NavBar() {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(15)
  const navigate = useNavigate()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
    setOpen(false)
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <header
      className={cx(
        "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-6xl justify-center rounded-lg border border-transparent px-3 py-3 transition duration-300",
        scrolled || open
          ? "border-white/20 bg-black/80 shadow-2xl shadow-black/20 backdrop-blur-sm"
          : "bg-black/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <a href="/" aria-label="Home" className="flex items-center gap-2">
            <span className="sr-only">Trade Workstation</span>
            {/* <SolarLogo className="w-22" /> */}
            <span className="text-xl font-semibold text-white">TradeWorkstation</span>
          </a>
          <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-medium">
              <button 
                onClick={() => scrollToSection('solutions')}
                className="px-2 py-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              {/* <button 
                onClick={() => scrollToSection('analytics')}
                className="px-2 py-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Analytics
              </button> */}
              <button 
                onClick={() => scrollToSection('pricing')}
                className="px-2 py-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </button>
            </div>
          </nav>
          <Button
            onClick={handleLoginClick}
            variant="secondary"
            className="hidden h-10 w-32 font-semibold sm:block"
          >
            Login
          </Button>
          <Button
            onClick={() => setOpen(!open)}
            variant="secondary"
            className="p-1.5 sm:hidden"
            aria-label={open ? "CloseNavigation Menu" : "Open Navigation Menu"}
          >
            {!open ? (
              <RiMenuFill
                className="size-6 shrink-0 text-white"
                aria-hidden
              />
            ) : (
              <RiCloseFill
                className="size-6 shrink-0 text-white"
                aria-hidden
              />
            )}
          </Button>
        </div>
        <nav
          className={cx(
            "mt-6 flex flex-col gap-6 text-lg ease-in-out will-change-transform sm:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-medium text-gray-300">
            <li>
              <button 
                onClick={() => scrollToSection('solutions')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('analytics')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Analytics
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </button>
            </li>
          </ul>
          <Button onClick={handleLoginClick} variant="secondary" className="text-lg">
            Login
          </Button>
        </nav>
      </div>
    </header>
  )
}
