import { RiArrowRightUpLine } from "@remixicon/react"
import { FadeContainer, FadeDiv, FadeSpan } from "../Fade"
import GameOfLife from "./HeroBackground"
import { SparkleButton } from "./SparkleButton"

export function Hero() {
  return (
    <section aria-label="hero" className="relative min-h-[70vh] flex items-center justify-center">
      {/* Background Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <GameOfLife />
      </div>
      
      {/* Content */}
      <FadeContainer className="relative z-10 flex flex-col items-center justify-center px-4">
        <FadeDiv className="mx-auto">
          <a
            aria-label="View latest update the changelog page"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto w-full"
          >
            {/* <div className="inline-flex max-w-full items-center gap-3 rounded-full bg-white/5 px-2.5 py-0.5 pr-3 pl-0.5 font-medium text-gray-900 ring-1 shadow-lg shadow-orange-400/20 ring-black/10 filter backdrop-blur-[1px] transition-colors hover:bg-orange-500/[2.5%] focus:outline-hidden sm:text-sm">
              <span className="shrink-0 truncate rounded-full border bg-gray-50 px-2.5 py-1 text-sm text-gray-600 sm:text-xs">
                News
              </span>
              <span className="flex items-center gap-1 truncate">
                <span className="w-full truncate">
                  Smart Irrigation System Launch
                </span>

                <RiArrowRightUpLine className="size-4 shrink-0 text-gray-700" />
              </span>
            </div> */}
          </a>
        </FadeDiv>
        <h1 className="mt-8 text-center text-5xl font-semibold tracking-tighter text-white sm:text-7xl sm:leading-[5.5rem]">
          <FadeSpan>Data</FadeSpan> <FadeSpan>Driven</FadeSpan>
          <br />
          <FadeSpan>Trading</FadeSpan> <FadeSpan>Decisions</FadeSpan>
        </h1>
        <p className="mt-5 max-w-xl text-center text-base text-balance text-gray-300 sm:mt-8 sm:text-xl">
          <FadeSpan>Track, analyze, and optimize</FadeSpan>{" "}
          <FadeSpan>your trading performance</FadeSpan>{" "}
          <FadeSpan>with institutional-grade analytics.</FadeSpan>
        </p>  
        
        <FadeDiv>
          <div className="mt-6">
            <SparkleButton href="/register">
              Get Started
            </SparkleButton>
          </div>
        </FadeDiv>

      </FadeContainer>
    </section>
  )
}
