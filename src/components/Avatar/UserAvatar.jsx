import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Function to generate a consistent color based on the name
const getColorFromName = (name) => {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ]
  const hash = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function UserAvatar({ name, isSpeaking }) {
  const initial = name?.charAt(0).toUpperCase()
  const bgColor = getColorFromName(name)

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative rounded-full p-0.5 transition-all duration-300",
          isSpeaking && "speaking-glow", // Apply the custom glow class
        )}
      >
        <Avatar className={cn("h-12 w-12 border-2 border-transparent", bgColor)}>
          <AvatarFallback className="text-xl font-medium text-white bg-transparent">{initial}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-sm font-medium text-gray-300 truncate max-w-[80px]">{name}</span>
    </div>
  )
}
