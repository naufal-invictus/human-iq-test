"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { questions } from "@/lib/questions"
import { Sparkles, Brain, Trophy, RotateCcw, Clock } from "lucide-react"
import confetti from "canvas-confetti"

export default function BattleIQGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "result">("start")
  const [currentRound, setCurrentRound] = useState(0)
  const [humanScore, setHumanScore] = useState(0)
  const [gorillaScore, setGorillaScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [gorillaAnswer, setGorillaAnswer] = useState<string | null>(null)
  const [gorillaThinking, setGorillaThinking] = useState(false)
  const [roundResult, setRoundResult] = useState<"" | "human" | "gorilla">("")
  const [showQuestion, setShowQuestion] = useState(true)
  const [timeLeft, setTimeLeft] = useState(5)
  const [timerActive, setTimerActive] = useState(false)
  const [timeExpired, setTimeExpired] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Handle timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false)
      setTimeExpired(true)
      handleTimeExpired()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timerActive, timeLeft])

  const startGame = () => {
    setGameState("playing")
    setCurrentRound(0)
    setHumanScore(0)
    setGorillaScore(0)
    setShowQuestion(true)
    resetTimer()
    setTimerActive(true)
    playSound("start")
  }

  const resetTimer = () => {
    setTimeLeft(5)
    setTimeExpired(false)
  }

  const handleTimeExpired = () => {
    if (!selectedAnswer) {
      // If human didn't answer in time
      const correctAnswer = questions[currentRound].correctAnswer
      setGorillaAnswer(correctAnswer)
      setGorillaScore(gorillaScore + 1)
      setRoundResult("gorilla")

      toast({
        title: "Time's up!",
        description: "The gorilla answered faster than you!",
      })

      launchBananaConfetti()

      // Move to next round after delay
      setTimeout(() => {
        moveToNextRound()
      }, 2500)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || gorillaAnswer || timeExpired) return

    setSelectedAnswer(answer)
    setTimerActive(false) // Stop the timer when human answers
    setGorillaThinking(true)

    // Play selection sound
    playSound("select")

    // Gorilla "thinking" delay - shorter than before to emphasize speed
    setTimeout(
      () => {
        const correctAnswer = questions[currentRound].correctAnswer
        setGorillaAnswer(correctAnswer)
        setGorillaThinking(false)

        // Determine round winner
        if (currentRound === 0 && answer === correctAnswer) {
          // First round: Human wins if they answer correctly
          setHumanScore(humanScore + 1)
          setRoundResult("human")
          playSound("win")
          toast({
            title: "You won this round!",
            description: "Don't get too confident though...",
          })
        } else {
          // All other rounds OR if human answers incorrectly in round 1
          // OR if both answer correctly (gorilla wins due to speed)
          setGorillaScore(gorillaScore + 1)
          setRoundResult("gorilla")
          playSound("lose")
          launchBananaConfetti()

          let tauntMessage = ""
          if (answer === correctAnswer) {
            tauntMessage = "Correct answer, but I'm faster! Gorillas have superior neural pathways."
          } else {
            const taunts = [
              "Oook oook... better luck next time, homo sapiens.",
              "Bananas fuel my superior intellect in advanced physics. Try some!",
              "Evolution clearly took a wrong turn with your mathematical abilities.",
              "Perhaps you should stick to basic arithmetic instead of quantum physics?",
              "If I had opposable thumbs, I'd write out the full equation for you.",
            ]
            tauntMessage = taunts[Math.floor(Math.random() * taunts.length)]
          }

          toast({
            title: "Gorilla wins!",
            description: tauntMessage,
          })
        }

        // Move to next round or end game
        setTimeout(() => {
          moveToNextRound()
        }, 2500)
      },
      800 + Math.random() * 500, // Gorilla answers very quickly
    )
  }

  const moveToNextRound = () => {
    if (currentRound < questions.length - 1) {
      setCurrentRound(currentRound + 1)
      setSelectedAnswer(null)
      setGorillaAnswer(null)
      setRoundResult("")
      setShowQuestion(false)

      // Brief pause before showing next question
      setTimeout(() => {
        setShowQuestion(true)
        resetTimer()
        setTimerActive(true)
      }, 500)
    } else {
      setGameState("result")
      playSound("end")
    }
  }

  const playAgain = () => {
    setGameState("start")
    setCurrentRound(0)
    setHumanScore(0)
    setGorillaScore(0)
    setSelectedAnswer(null)
    setGorillaAnswer(null)
    setRoundResult("")
    resetTimer()
  }

  const launchBananaConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFFF00", "#F0E68C"],
      shapes: ["circle"],
    })
  }

  const playSound = (type: "start" | "select" | "win" | "lose" | "end") => {
    // In a real implementation, we would play actual sounds here
    console.log(`Playing sound: ${type}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toaster />

      {gameState === "start" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-900 to-red-700 rounded-xl shadow-2xl text-white"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-6 tracking-tighter">
            Battle Math Test
            <span className="block text-2xl md:text-4xl mt-2 text-yellow-300">Human vs Gorilla</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-between w-full my-8 gap-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-blue-700 rounded-full flex items-center justify-center mb-4 border-4 border-blue-300">
                <Brain className="w-16 h-16 md:w-24 md:h-24 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">HUMAN</h2>
            </div>

            <div className="text-4xl font-bold">VS</div>

            <div className="flex-1 flex flex-col items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-green-300 relative">
                <Image src="/gorilla.jpg" alt="Gorilla" fill style={{ objectFit: "cover" }} priority />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">GORILLA</h2>
            </div>
          </div>

          <p className="text-center mb-8 text-lg">
            Think you're better at math and physics than a gorilla? Prepare for the ultimate battle of scientific
            knowledge! You have 5 seconds to answer each question.
          </p>

          <Button
            onClick={startGame}
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-8 py-6"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Begin Battle
          </Button>
        </motion.div>
      )}

      {gameState === "playing" && showQuestion && (
        <motion.div
          key={`question-${currentRound}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-6 text-white"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mr-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold">HUMAN</h3>
                <p className="text-xl font-bold">{humanScore}</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">ROUND {currentRound + 1}/5</h2>
              <div className="flex space-x-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < currentRound
                        ? "bg-yellow-400"
                        : i === currentRound
                          ? "bg-green-400 animate-pulse"
                          : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div>
                <h3 className="font-bold text-right">GORILLA</h3>
                <p className="text-xl font-bold text-right">{gorillaScore}</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden ml-2 relative">
                <Image src="/gorilla.jpg" alt="Gorilla" fill style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-4">
            <div
              className={`flex items-center justify-center p-2 rounded-full ${
                timeLeft > 3 ? "bg-green-600" : timeLeft > 1 ? "bg-yellow-600" : "bg-red-600 animate-pulse"
              }`}
            >
              <Clock className="w-5 h-5 mr-1" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Question:</h3>
            <p className="text-lg mb-4">{questions[currentRound].question}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {questions[currentRound].options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null || timeExpired}
                className={`p-4 rounded-lg text-left transition-colors ${
                  selectedAnswer === option
                    ? "bg-blue-600 border-2 border-blue-300"
                    : gorillaAnswer === option && roundResult !== ""
                      ? "bg-green-600 border-2 border-green-300"
                      : "bg-gray-700 hover:bg-gray-600 border-2 border-transparent"
                } ${selectedAnswer && selectedAnswer !== questions[currentRound].correctAnswer && selectedAnswer === option ? "bg-red-600 border-red-300" : ""}`}
              >
                <span className="font-medium">{option}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  timeExpired ? "bg-red-400" : selectedAnswer ? "bg-blue-400" : "bg-gray-600"
                }`}
              ></div>
              <span>Human {timeExpired ? "time expired" : selectedAnswer ? "answered" : "thinking..."}</span>
            </div>

            <div className="flex items-center">
              <span>Gorilla {gorillaThinking ? "thinking..." : gorillaAnswer ? "answered" : "waiting"}</span>
              <div
                className={`w-3 h-3 rounded-full ml-2 ${
                  gorillaThinking ? "bg-yellow-400 animate-pulse" : gorillaAnswer ? "bg-green-400" : "bg-gray-600"
                }`}
              ></div>
            </div>
          </div>

          {roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-lg text-center font-bold text-xl ${
                roundResult === "human" ? "bg-blue-600/50" : "bg-green-600/50"
              }`}
            >
              {roundResult === "human" ? "Human wins this round!" : "Gorilla wins this round!"}
            </motion.div>
          )}
        </motion.div>
      )}

      {gameState === "result" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8">Battle Results</h2>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex-1 bg-blue-900/50 p-6 rounded-xl">
              <div className="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">HUMAN</h3>
              <div className="text-5xl font-bold mb-2">{humanScore}</div>
              <p className="text-blue-300">Physics Knowledge: Basic</p>
              <p className="text-blue-300 text-sm mt-1">Speed: Slow</p>
            </div>

            <div className="text-4xl font-bold">VS</div>

            <div className="flex-1 bg-green-900/50 p-6 rounded-xl">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 relative">
                <Image src="/gorilla.jpg" alt="Gorilla" fill style={{ objectFit: "cover" }} />
              </div>
              <h3 className="text-xl font-bold mb-2">GORILLA</h3>
              <div className="text-5xl font-bold mb-2">{gorillaScore}</div>
              <p className="text-green-300">Physics Knowledge: PhD Level</p>
              <p className="text-green-300 text-sm mt-1">Speed: Lightning Fast</p>
            </div>
          </div>

          <div className="mb-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">
              {gorillaScore > humanScore ? "The Gorilla is Victorious!" : "Impossible! A Human Victory?"}
            </h3>
            <p className="text-lg">
              {gorillaScore > humanScore
                ? "Not only smarter but faster too! The gorilla's neural pathways are optimized for rapid calculations."
                : "This must be a glitch in the matrix. Gorillas are recalibrating..."}
            </p>
          </div>

          <Button
            onClick={playAgain}
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-8 py-6"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  )
}
