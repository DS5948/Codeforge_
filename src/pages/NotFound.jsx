import { Link } from "react-router-dom"
import { MonitorOffIcon as TerminalOff } from "lucide-react"
import { Button } from "@/components/ui/button"

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 py-12 text-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
        <TerminalOff className="mx-auto size-24 text-green-500" />
        <h1 className="text-7xl font-bold tracking-tighter text-green-500 sm:text-8xl md:text-9xl font-mono">404</h1>
        <p className="text-xl text-gray-300 md:text-2xl">Oops! This page doesn&apos;t exist.</p>
        <p className="text-gray-400">It looks like you&apos;ve ventured into uncharted territory.</p>
        <Link to="/" passHref>
          <Button className="inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 text-base font-semibold text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound;