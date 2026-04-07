import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Users,
  Mic,
  Trophy,
  Globe,
  GraduationCap,
  UserCheck,
  Zap,
  Play,
  Star,
  Github,
  Twitter,
  DiscIcon as Discord,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Instagram,
  Code,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar/Avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

export default function LandingPage() {
  
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {      
      e.preventDefault()
      sendMessageMutation({name, email, message})
  }
  const {mutate: sendMessageMutation, isPending: sendingMessage} = useMutation({
    mutationFn: async ({name, email, message}) => {
      try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-to-sheet`, {
        method: "POST",
        body: JSON.stringify({name, email, message}),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await res.json()
      
      if (result.success) {
        toast.success("Message sent successfully!")
      } else {
        toast.error("Something went wrong.")
      }
    } catch (err) {
      toast.error("Error sending message.")
      console.error(err)
    }
    },
    onSuccess: () => {
      setName("")
      setEmail("")
      setMessage("")
    }
  })
  const { data: authUser, isLoading: loadingUser } = useQuery({
    queryKey: ["authUser"],
  });

  const handleCtaClick = (url) => {
    if (!authUser) {
      navigate("/login");
    } else {
      navigate(`${url}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const slideInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

const slideInFromRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <a href="/">
              <div className="flex items-center gap-2">
      {/* Using the Code icon from Lucide React, styled with a vibrant purple color */}
      <Code className="h-7 w-7 text-[#8B5CF6]" />
      {/* The text "Codeforge" with a bold white font and tight tracking for a modern look */}
      <span className="text-white text-2xl font-bold tracking-tight">Codeforge</span>
    </div>
    </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center space-x-8"
            >
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#use-cases"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Use Cases
              </a>
              <a
                href="#demo"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Demo
              </a>
              <a
                href="#contact"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contact Us
              </a>
              {!authUser ? (
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
                >
                  Sign In
                </Button>
              ) : (
                <Avatar name={authUser.username} />
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.05) 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-shadow-3d"
            >
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                Collaborate. Compete.
              </span>
              <br />
              <span className="text-white">Code Together.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              The ultimate collaborative coding platform where developers unite
              to build, battle, and breakthrough together. Real-time
              collaboration meets competitive programming in one powerful
              environment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button
                onClick={() => {
                  handleCtaClick("/home");
                }}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Try Now
              </Button>
              <Button
                onClick={() => {
                  handleCtaClick("/code-battle");
                }}
                size="lg"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-3 text-lg bg-transparent"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Join a Code Battle
              </Button>
            </motion.div>
            {/* Code Animation Mockup */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInScale}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">
                    collaborative-session.js
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">3 active</span>
                  </div>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="text-purple-400">
                      {"// Real-time collaborative coding"}
                    </div>
                    <div className="text-blue-400">
                      function buildTogether() {"{"}
                    </div>
                    <div className="ml-4 text-green-400">
                      const team = ['Alice', 'Bob', 'Charlie'];
                    </div>
                    <div className="ml-4 text-gray-300">
                      return team.map(dev =&gt; dev.code());
                    </div>
                    <div className="text-blue-400">{"}"}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Inspirational Quotes Section */}
      <section className="py-24 bg-gray-900/50">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {/* <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Inspirational Quotes</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Words of wisdom from the greatest minds in tech and beyond.
            </p>
          </motion.div> */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              {'"The only way to do great work is to love what you do."'}
            </p>
            <p className="text-xl sm:text-2xl text-gray-300 font-semibold">
              - Steve Jobs
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-700"></div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-900/50">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for Modern Developers
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to collaborate, compete, and create amazing
              code together.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-500 mb-4" />
                  <CardTitle className="text-white">
                    Collaborative Coding Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Create private or public rooms where teams can code together
                    in real-time with live cursors and instant sync.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <Mic className="h-12 w-12 text-blue-500 mb-4" />
                  <CardTitle className="text-white">
                    Real-time Voice Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Built-in voice communication with crystal clear audio,
                    push-to-talk, and room-based channels.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 hover:border-yellow-500 transition-colors">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
                  <CardTitle className="text-white">
                    Code Battles & Leaderboards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Compete in timed coding challenges, climb the leaderboards,
                    and prove your skills against other developers.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors">
                <CardHeader>
                  <Globe className="h-12 w-12 text-green-500 mb-4" />
                  <CardTitle className="text-white">
                    Multi-language Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Code in JavaScript, Python, C++, Java, Go, Rust, and 20+
                    more languages with full syntax highlighting.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Every Developer
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Whether you're teaching, learning, interviewing, or competing,
              Codeforge adapts to your needs.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30 hover:border-purple-500 transition-all">
                <CardHeader>
                  <GraduationCap className="h-12 w-12 text-purple-400 mb-4" />
                  <CardTitle className="text-white text-xl">Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base">
                    Create interactive coding lessons, monitor student progress
                    in real-time, and provide instant feedback through
                    collaborative sessions and voice guidance.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 hover:border-blue-500 transition-all">
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-400 mb-4" />
                  <CardTitle className="text-white text-xl">Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base">
                    Learn together with peers, get help from instructors,
                    practice with coding challenges, and build projects
                    collaboratively in a supportive environment.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 hover:border-green-500 transition-all">
                <CardHeader>
                  <UserCheck className="h-12 w-12 text-green-400 mb-4" />
                  <CardTitle className="text-white text-xl">
                    Interviewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base">
                    Conduct seamless technical interviews with real-time code
                    collaboration, voice communication, and the ability to
                    observe candidate problem-solving in action.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30 hover:border-yellow-500 transition-all">
                <CardHeader>
                  <Zap className="h-12 w-12 text-yellow-400 mb-4" />
                  <CardTitle className="text-white text-xl">
                    Competitive Programmers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-base">
                    Participate in coding battles, climb leaderboards, practice
                    algorithms together, and sharpen your skills in a
                    competitive yet collaborative environment.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-24 bg-gray-900/50">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See Codeforge in Action
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the power of real-time collaboration and competitive
              coding.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideInFromLeft}>
              <h3 className="text-2xl font-bold mb-6">
                Real-time Collaboration
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Live cursor tracking and user presence
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Instant code synchronization across all users
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Integrated voice chat with spatial audio
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Smart conflict resolution and merge handling
                </li>
              </ul>
            </motion.div>
            <motion.div variants={slideInFromRight} className="relative">
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                    <p className="text-gray-400">Interactive Demo Video</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to see live collaboration
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Developers Worldwide
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">
                    {
                      '"Codeforge revolutionized how we conduct technical interviews. The real-time collaboration and voice'
                    }
                    {"chat make it feel like we're in the same room.\""}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">SJ</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Sarah Johnson</p>
                      <p className="text-gray-400 text-sm">
                        Senior Engineering Manager
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">
                    {
                      "\"The code battles feature is addictive! It's made practicing algorithms fun and competitive. I've"
                    }
                    {'improved so much since joining the platform."'}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">MC</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Mike Chen</p>
                      <p className="text-gray-400 text-sm">
                        Competitive Programmer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">
                    {
                      '"Teaching coding has never been easier. My students love the collaborative environment, and I can'
                    }
                    {'provide real-time guidance through voice chat."'}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">ER</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Emily Rodriguez
                      </p>
                      <p className="text-gray-400 text-sm">CS Professor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* Contact Us Section */}
      <section
        id="contact"
        className="relative py-24 bg-gray-950 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-gray-950 to-blue-900/10" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.08) 1px, transparent 0)`,
            backgroundSize: "80px 80px",
          }}
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? We'd love to
              hear from you!
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div variants={slideInFromLeft} className="space-y-8">
              <h3 className="text-3xl font-bold text-white">Reach Out to Us</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Whether you have a question about features, pricing, or anything
                else, our team is ready to answer all your questions.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Mail className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-lg font-semibold text-white">Email Us</p>
                    <a
                      href="mailto:support@codeforge.com"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      support@codeforge.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-lg font-semibold text-white">Call Us</p>
                    <a
                      href="tel:+1234567890"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      +91 8517922725
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-lg font-semibold text-white">Visit Us</p>
                    <p className="text-gray-400">
                      MNNIT Allahabad, Teliyarganj, Prayagraj, 211004
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <Link to="https://github.com/DS4948/" target="_blank">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Github className="h-6 w-6" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                </Link>
                <Link
                  to="https://www.linkedin.com/in/dheeraj5948/"
                  target="_blank"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                  </Button>
                </Link>
                <Link
                  to="https://www.instagram.com/dheerajsharma2425/"
                  target="_blank"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div variants={slideInFromRight}>
              <Card className="bg-gray-800 border border-gray-700 shadow-lg shadow-purple-900/20 p-6 md:p-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-3xl font-bold">
                    Send Us a Message
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-gray-300 text-base">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Your Name"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-300 text-base"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="your@example.com"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="message"
                        className="text-gray-300 text-base"
                      >
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Your message..."
                        rows={5}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg shadow-purple-500/30 transition-all"
                    >
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Code2 className="h-8 w-8 text-purple-500" />
                <span className="text-xl font-bold">Codeforge</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate collaborative coding platform where developers
                unite to build, battle, and breakthrough together.
              </p>
              <div className="flex space-x-4">
                <Link to="https://github.com/DS4948/" target="_blank">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Github className="h-6 w-6" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                </Link>
                <Link
                  to="https://www.linkedin.com/in/dheeraj5948/"
                  target="_blank"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                    <span className="sr-only">LinkedIn</span>
                  </Button>
                </Link>
                <Link
                  to="https://www.instagram.com/dheerajsharma2425/"
                  target="_blank"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Codeforge. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Built with:</span>
                <div className="flex space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-300"
                  >
                    React
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-300"
                  >
                    WebRTC
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-300"
                  >
                    Socket.IO
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-gray-800 text-gray-300"
                  >
                    Node.js
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
