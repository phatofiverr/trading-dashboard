"use client"

import { motion } from "motion/react"

const ChipViz = () => {
  const createVariants = ({
    scale,
    delay,
  }: {
    scale: number
    delay: number
  }) => ({
    initial: { scale: 1 },
    animate: {
      scale: [1, scale, 1],
      transition: {
        duration: 2,
        times: [0, 0.2, 1],
        ease: [0.23, 1, 0.32, 1],
        repeat: Infinity,
        repeatDelay: 2,
        delay,
      },
    },
  })

  return (
    <div className="relative flex items-center">
      <div className="relative">
        <motion.div
          variants={createVariants({ scale: 1.1, delay: 0 })}
          initial="initial"
          animate="animate"
          className="absolute -inset-px z-0 rounded-full bg-linear-to-r from-[#818CF8] via-[#818CF8] to-[#818CF8] opacity-30 blur-xl"
        />
        <motion.div
          variants={createVariants({ scale: 1.08, delay: 0.1 })}
          initial="initial"
          animate="animate"
          className="relative z-0 min-h-[80px] min-w-[80px] rounded-full border bg-linear-to-b from-white to-indigo-50 shadow-xl shadow-[#818CF8]/20"
        >
          <motion.div
            variants={createVariants({ scale: 1.06, delay: 0.2 })}
            initial="initial"
            animate="animate"
            className="absolute inset-1 rounded-full bg-linear-to-t from-[#818CF8] via-[#818CF8] to-[#818CF8] p-0.5 shadow-xl"
          >
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black/40 shadow-xs shadow-white/40 will-change-transform">
              <div className="size-full bg-black/30" />
              <motion.div
                variants={createVariants({ scale: 1.04, delay: 0.3 })}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-full bg-linear-to-t from-[#818CF8] via-[#818CF8] to-[#818CF8] opacity-50 shadow-[inset_0_0_16px_4px_rgba(0,0,0,1)]"
              />
              <motion.div
                variants={createVariants({ scale: 1.02, delay: 0.4 })}
                initial="initial"
                animate="animate"
                className="absolute inset-[6px] rounded-full bg-white/10 p-1 backdrop-blur-[1px]"
              >
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-white to-gray-300 shadow-lg shadow-black/40">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 213 235" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6"
                  >
                    <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M0 88.125V182.125H29.5833C32.6912 182.125 35.7687 182.733 38.6403 183.914C41.5113 185.095 44.1208 186.826 46.3179 189.008C48.5157 191.19 50.2592 193.781 51.4487 196.632C52.6375 199.483 53.25 202.539 53.25 205.625V235H124.25L213 146.875V52.875H183.417C180.309 52.875 177.231 52.2672 174.359 51.0862C171.489 49.9052 168.879 48.1742 166.682 45.992C164.485 43.8099 162.741 41.2191 161.551 38.368C160.362 35.517 159.75 32.4611 159.75 29.375V0H88.75L0 88.125ZM100.583 176.25H59.1667V111.625L112.417 58.75H153.833V123.375L100.583 176.25Z" 
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default ChipViz
