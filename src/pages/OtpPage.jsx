import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast'

const OtpPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

useEffect(() => {  
  if (!email) {
    navigate("/signup");
  }
}, [navigate]);

  const [otp, setOtp] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      toast.success("OTP verified successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/"); // Redirect after successful verification
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: resendMutation, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend OTP");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const handleResendOtp = (e) => {
    e.preventDefault();
    if (isResending) return;
    resendMutation();
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="absolute top-8 flex items-center space-x-2 text-2xl font-bold text-white">
        <Code className="h-8 w-8 text-purple-500" />
        <span>Codeforge</span>
      </div>

      <Card className="w-full max-w-md rounded-xl border border-gray-800 bg-zinc-950 p-8 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold text-white">
            Verify your identity
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter the 6-digit code sent to your email {email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-14 rounded-lg border border-gray-700 bg-gray-950 text-white text-xl focus:border-violet-500 focus:ring-violet-500"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm font-medium text-violet-400 hover:underline disabled:opacity-50"
              disabled={isResending}
              onClick={handleResendOtp}
            >
              {isResending ? "Resending..." : "Resend Code"}
            </button>
          </div>

          <Button
            type="button"
            disabled={otp.length !== 6 || isPending}
            onClick={() => mutate({ email, otp })}
            className="w-full rounded-lg bg-white py-3 text-lg font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>

          <div className="text-center text-sm">
            <Link to="/signup" className="text-violet-400 hover:underline">
              Wrong email? Go back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpPage;
