import { motion } from "framer-motion"

export default function LoadingAnimation() {
  const bracketLeftVariants = {
    animate: {
      x: [0, -10, 0], // Move left and back
      scale: [1, 1.05, 1], // Subtle pulse
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const bracketRightVariants = {
    animate: {
      x: [0, 10, 0], // Move right and back
      scale: [1, 1.05, 1], // Subtle pulse
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20">
      <div className="flex items-center space-x-4">
        <motion.span
          className="text-violet-500 text-4xl font-bold"
          variants={bracketLeftVariants}
          initial="initial"
          animate="animate"
        >
          {"<"}
        </motion.span>
        <span className="text-white text-4xl font-bold">Codeforge</span>
        <motion.span
          className="text-violet-500 text-4xl font-bold"
          variants={bracketRightVariants}
          initial="initial"
          animate="animate"
        >
          {">"}
        </motion.span>
      </div>
    </div>
  )
}
