import { Code2, GalleryVerticalEnd } from "lucide-react"

import SignupForm from "@/components/SignupForm/SignupForm" 

const SignUpPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-zinc-950 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md text-primary-foreground">
            <Code2 className="h-8 w-8 text-purple-500" />
          </div>
          Codeforge
        </a>
        <SignupForm />
      </div>
    </div>
  )
}

export default SignUpPage
