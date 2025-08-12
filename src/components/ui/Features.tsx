import {
  RiBarChartLine,
  RiCheckLine,
  RiCircleLine,
  RiDatabaseLine,
  RiLineChartLine,
  RiPieChartLine,
  RiArrowUpLine,
  RiLoaderFill,
  RiNotification2Line,
  RiShieldCheckLine,
  RiTimeLine,
} from "@remixicon/react"
import { Icons } from "../Icons"
import { Orbit } from "../Orbit"
import ChipViz from "./ChipViz"

export default function Features() {
  return (
    <section
      aria-label="Trading Journal Features"
      id="solutions"
      className="relative mx-auto max-w-6xl scroll-my-24"
    >
      {/* Vertical Lines */}
      <div className="pointer-events-none inset-0 select-none">
        {/* Left */}
        <div
          className="absolute inset-y-0 my-[-5rem] w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
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
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
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
        {/* Middle */}
        <div
          className="absolute inset-y-0 left-1/2 -z-10 my-[-5rem] w-px"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
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
        {/* 25% */}
        <div
          className="absolute inset-y-0 left-1/4 -z-10 my-[-5rem] hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
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
        {/* 75% */}
        <div
          className="absolute inset-y-0 left-3/4 -z-10 my-[-5rem] hidden w-px sm:block"
          style={{
            maskImage:
              "linear-gradient(transparent, white 5rem, white calc(100% - 5rem), transparent)",
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
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-0">
        {/* Content */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-[#818CF8]">
            Smart Trading Analytics
            <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-[#818CF8]" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-white md:text-4xl">
            A comprehensive system for complete trading performance monitoring
          </p>
          <p className="mt-4 text-balance text-gray-300">
            Deploy intelligent analytics and automated risk management across
            your trading accounts, strategies, and portfolio with our
            integrated platform.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg
            className="absolute size-full [mask-image:linear-gradient(transparent,white_10rem)]"
            // style={{
            //   maskImage:
            //     "linear-gradient(transparent, white 20rem, white calc(100% - 20rem), transparent)",
            // }}
          >
            <defs>
              <pattern
                id="diagonal-feature-pattern"
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
                      className="stroke-white/5"
                      strokeWidth="1"
                    />
                  )
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>
          <div className="pointer-events-none h-[26rem] p-10 select-none">
            <div className="relative flex flex-col items-center justify-center">
              <Orbit
                durationSeconds={40}
                radiusPx={140}
                keepUpright
                orbitingObjects={[
                  <div
                    key="obj1"
                    className="relative flex items-center justify-center"
                  >
                    <RiBarChartLine className="z-10 size-5 text-white" />
                    <div className="absolute size-10 rounded-full bg-white/20 ring-1 shadow-lg ring-white/10"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-red-500 p-1 text-xs ring-1 ring-white/20">
                          <RiCircleLine className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-black/60 py-0.5 pr-1.5 pl-1 text-xs text-white whitespace-nowrap ring-1 ring-white/20">
                          Risk Alert
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        animationDelay: "1s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-[#818CF8]/50"
                    ></div>
                  </div>,

                  <div
                    key="obj2"
                    className="relative flex items-center justify-center"
                  >
                    <RiArrowUpLine className="z-10 size-5 text-white" />
                    <div className="absolute size-10 rounded-full bg-white/20 ring-1 shadow-lg ring-white/10"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-gray-500 p-1 text-xs ring-1 ring-white/20">
                          <RiLoaderFill className="size-3 shrink-0 animate-spin text-white" />
                        </div>
                        <div className="rounded-r-full bg-black/60 py-0.5 pr-1.5 pl-1 text-xs text-white ring-1 ring-white/20">
                          Analyzing
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        animationDelay: "4s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-[#818CF8]/50"
                    ></div>
                  </div>,

                  <div
                    key="obj3"
                    className="relative flex items-center justify-center"
                  >
                    <RiPieChartLine className="z-10 size-5 text-white" />
                    <div className="absolute size-10 rounded-full bg-white/20 ring-1 shadow-lg ring-white/10"></div>
                    <div
                      style={{
                        animationDelay: "2s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-[#818CF8]/50"
                    ></div>
                  </div>,
                  <div
                    key="obj4"
                    className="relative flex items-center justify-center"
                  >
                    <RiLineChartLine className="z-10 size-5 text-white" />
                    <div className="absolute size-10 rounded-full bg-white/20 ring-1 shadow-lg ring-white/10"></div>
                    <div className="absolute -top-5 left-4">
                      <div className="flex gap-1">
                        <div className="flex items-center justify-center rounded-l-full bg-emerald-500 p-1 text-xs ring-1 ring-white/20">
                          <RiCheckLine className="size-3 shrink-0 text-white" />
                        </div>
                        <div className="rounded-r-full bg-black/60 py-0.5 pr-1.5 pl-1 text-xs text-white ring-1 ring-white/20">
                          Profitable
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        animationDelay: "6s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-[#818CF8]/50"
                    ></div>
                  </div>,
                  <div
                    key="obj5"
                    className="relative flex items-center justify-center"
                  >
                    <RiTimeLine className="z-10 size-5 text-white" />
                    <div className="absolute size-10 rounded-full bg-white/20 ring-1 shadow-lg ring-white/10"></div>
                    <div
                      style={{
                        animationDelay: "3s",
                      }}
                      className="absolute size-10 animate-[ping_7s_ease_infinite] rounded-full ring-1 ring-[#818CF8]/50"
                    ></div>
                  </div>,
                ]}
              >
                <div className="relative flex h-48 w-48 items-center justify-center">
                  <div className="rounded-full p-1 ring-1 ring-white/20">
                    <div className="relative z-10 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-[inset_0px_-15px_20px_rgba(0,0,0,0.3),0_7px_10px_0_rgba(0,0,0,0.4)] ring-white/10">
                      <img src="/solarmark.svg" alt="SolarMark" className="size-10" />
                    </div>
                    <div className="absolute inset-12 animate-[spin_8s_linear_infinite] rounded-full bg-linear-to-t from-transparent via-[#818CF8] to-transparent blur-lg" />
                  </div>
                </div>
              </Orbit>
            </div>
          </div>
        </div>

        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-[#818CF8]">
            Precision Trading Analytics
            <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-[#818CF8]" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-white md:text-4xl">
            Turn every trade into a data-driven learning opportunity
          </p>
          <p className="mt-4 text-balance text-gray-300">
            Revolutionize your trading with AI-powered analytics that
            transforms raw trade data into actionable insights in real-time.
            Make informed decisions faster, reduce risk, and maximize
            profitability.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">
          <svg className="absolute size-full">
            <defs>
              <pattern
                id="diagonal-feature-pattern"
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
                      className="stroke-white/10"
                      strokeWidth="1"
                    />
                  )
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>
          <div className="relative h-[432px] w-[432px]">
            <svg
              id="grid"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="mask absolute size-[432px]"
            >
              <path
                className="stroke-white/20"
                d="M48 0v432M96 0v432M144 0v432M192 0v432M240 0v432M288 0v432M336 0v432M384 0v432M0 48h432M0 96h432M0 144h432M0 192h432M0 240h432M0 288h432M0 336h432M0 384h432"
              />
            </svg>

            <div className="pointer-events-none relative h-full select-none">
              <div className="absolute top-[192px] left-[191.8px]">
                <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                  <img src="/solarmark.svg" alt="SolarMark" className="h-8 w-8" />
                </div>
              </div>
              <div className="absolute top-[144px] left-[48px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      +2.5R
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[48px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      85%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[96px] left-[240px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      +1.8R
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[240px] left-[385px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      92%
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[337px] left-[336px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      +3.2R
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-[288px] left-[144px]">
                <div className="relative">
                  <div className="absolute inset-0 size-12 animate-pulse bg-[#818CF8]/30 blur-[3px]"></div>
                  <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#202020] to-[#101010] ring-1 shadow-sm ring-white/20">
                    <span className="text-sm font-medium text-gray-300">
                      78%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* easy integration */}
        <div className="col-span-2 my-auto px-2">
          <h2 className="relative text-lg font-semibold tracking-tight text-[#818CF8]">
            Easy Integration
            <div className="absolute top-1 -left-[7px] h-5 w-[3px] rounded-r-sm bg-[#818CF8]" />
          </h2>
          <p className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-white md:text-4xl">
            Scale your trading journal with plug-and-play simplicity
          </p>
          <p className="mt-4 text-balance text-gray-300">
            Add new trading accounts and strategies to your journal with zero
            setup required. Our systems automatically connect and coordinate
            with each other.
          </p>
        </div>
        <div className="relative col-span-2 flex items-center justify-center overflow-hidden">

          <svg
            className="absolute size-full [mask-image:linear-gradient(white_10rem,transparent)]"
          >
            <defs>
              <pattern
                id="diagonal-feature-pattern"
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
                      className="stroke-white/10"
                      strokeWidth="1"
                    />
                  )
                })}
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#diagonal-feature-pattern)"
            />
          </svg>

          <div className="pointer-events-none relative flex size-full h-[26rem] items-center justify-center p-10 select-none">
            <div className="relative">
              <div className="absolute top-[6rem] left-[6rem] z-20">
                <div className="relative mx-auto w-fit rounded-full from-[#202020] to-[#101010] p-1 ring-1 shadow-md shadow-black/20 ring-white/20">
                  <div className="w-fit rounded-full bg-linear-to-b from-gray-700 to-gray-800 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.09),0_3px_5px_0_rgba(0,0,0,0.19)] ring-white/50 ring-inset">
                    <RiNotification2Line
                      className="size-5 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-[6rem] right-[6rem] z-20">
                <div className="relative mx-auto w-fit rounded-full from-[#202020] to-[#101010] p-1 ring-1 shadow-md shadow-black/20 ring-white/20">
                  <div className="w-fit rounded-full bg-linear-to-b from-gray-700 to-gray-800 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiShieldCheckLine
                      className="size-5 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute right-[6rem] bottom-[6rem] z-20">
                <div className="relative mx-auto w-fit rounded-full from-[#202020] to-[#101010] p-1 ring-1 shadow-md shadow-black/20 ring-white/20">
                  <div className="w-fit rounded-full bg-linear-to-b from-gray-700 to-gray-800 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiDatabaseLine
                      className="size-5 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[6rem] left-[6rem] z-20">
                <div className="relative mx-auto w-fit rounded-full from-[#202020] to-[#101010] p-1 ring-1 shadow-md shadow-black/20 ring-white/20">
                  <div className="w-fit rounded-full bg-linear-to-b from-gray-700 to-gray-800 p-3 ring-1 shadow-[inset_0px_-2px_6px_rgba(0,0,0,0.05),0_7px_10px_0_rgba(0,0,0,0.10)] ring-white/50 ring-inset">
                    <RiBarChartLine
                      className="size-5 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {[0, 45, 135, 180, 225, 315, 360].map((rotation, index) => (
                <div
                  key={rotation}
                  className="absolute origin-left overflow-hidden"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div className="relative">
                    <div className="h-0.5 w-60 bg-linear-to-r from-white/30 to-transparent" />
                    <div
                      className="absolute top-0 left-0 h-0.5 w-28 bg-linear-to-r from-transparent via-[#818CF8] to-transparent"
                      style={{
                        animation: `gridMovingLine 5s linear infinite ${index * 1.2}s`,
                        animationFillMode: "backwards",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <ChipViz />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
