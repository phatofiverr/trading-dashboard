import {
  RiDiscordFill,
} from "@remixicon/react"
import { Link } from "react-router-dom"
// import { SolarLogo } from "../../../public/SolarLogo"
const CURRENT_YEAR = new Date().getFullYear()

const Footer = () => {
  const sections = {
    features: {
      title: "Features",
      items: [
        { label: "Trade Analytics", href: "#" },
        { label: "Risk Management", href: "#" },
        { label: "Performance Tracking", href: "#" },
        { label: "Strategy Testing", href: "#" },
        { label: "Portfolio Analysis", href: "#" },
      ],
    },
    company: {
      title: "Company",
      items: [
        { label: "About us", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Trading Education", href: "#" },
      ],
    },
    resources: {
      title: "Resources",
      items: [
        {
          label: "Discord Server",
          href: "https://discord.gg/4k29rppuhw",
          external: true,
        },
        { label: "Contact", href: "#" },
        { label: "Support", href: "#" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
    tools: {
      title: "Tools",
      items: [
        { label: "Strategy Builder", href: "#", external: true },
        { label: "Market Scanner", href: "#", external: true },
        { label: "Backtesting Engine", href: "#", external: true },
        { label: "API Documentation", href: "#" },
      ],
    },
  }

  return (
    <div className="px-4 xl:px-0">
      <footer
        id="footer"
        className="relative mx-auto flex max-w-6xl flex-wrap pt-4"
      >
        {/* Vertical Lines */}
        <div className="pointer-events-none inset-0">
          {/* Left */}
          <div
            className="absolute inset-y-0 my-[-5rem] w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-white/20"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>

          {/* Right */}
          <div
            className="absolute inset-y-0 right-0 my-[-5rem] w-px"
            style={{
              maskImage: "linear-gradient(transparent, white 5rem)",
            }}
          >
            <svg className="h-full w-full" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                className="stroke-white/20"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </svg>
          </div>
        </div>
        <svg
          className="mb-10 h-20 w-full border-y border-dashed border-white/20 stroke-white/20"
          // style={{
          //   maskImage:
          //     "linear-gradient(transparent, white 10rem, white calc(100% - 10rem), transparent)",
          // }}
        >
          <defs>
            <pattern
              id="diagonal-footer-pattern"
              patternUnits="userSpaceOnUse"
              width="64"
              height="64"
            >
              {Array.from({ length: 17 }, (_, i) => {
                const offset = i * 8
                return (
                  <path
                    key={i}
                    d={`M${-106 + offset} 110L${22 + offset} -18`}
                    stroke=""
                    strokeWidth="1"
                  />
                )
              })}
            </pattern>
          </defs>
          <rect
            stroke="none"
            width="100%"
            height="100%"
            fill="url(#diagonal-footer-pattern)"
          />
        </svg>
        
        {/* Company Info and Social */}
        <div className="mr-auto flex w-full justify-between lg:w-fit lg:flex-col">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-white">TradeJournal</span>
          </div>

          <div>
            <div className="mt-4 flex items-center">
              {/* Social Icons */}
              <a
                href="https://discord.gg/4k29rppuhw"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm p-2 text-gray-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <RiDiscordFill className="size-5" />
              </a>
            </div>
            <div className="ml-2 hidden text-sm text-gray-400 lg:inline">
              &copy; {CURRENT_YEAR} TradeJournal, Inc.
            </div>
          </div>
        </div>

        {/* Footer Sections */}
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="mt-10 min-w-44 pl-2 lg:mt-0 lg:pl-0">
            <h3 className="mb-4 font-medium text-white sm:text-sm">
              {section.title}
            </h3>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.label} className="text-sm">
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-400 transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  )
}

export default Footer
