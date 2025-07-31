"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const AuthSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type AuthFormValues = z.infer<typeof AuthSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const { login: authLogin } = useAuth();
  
  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    setError("");
      setSuccess("");
    
    try {
      if (mode === "signin") {
        const response = await login(data.email, data.password);
        // Store token using auth context
        authLogin(response.access_token);
        // Redirect to chat page
        router.push("/chat");
      } else {
        await signup(data.email, data.password);
        // After successful signup, switch to signin mode
        setMode("signin");
        setSuccess("Account created successfully. Please sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
        setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleTestUser = async () => {
    setValue("email", "test@example.com");
    setValue("password", "password123");
    
    // Trigger form submission after a brief delay to allow form state to update
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-900">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              {...register("email")}
              disabled={loading}
              className="mb-1"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register("password")}
              disabled={loading}
              className="mb-1"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : "Signing up..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </Button>
        </form>
        <div className="flex justify-between items-center mt-4">
          <button
            className="text-sm cursor-pointer text-blue-600 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            disabled={loading}
          >
            {mode === "signin"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
          <button
            className="text-sm cursor-pointer text-green-600 hover:text-green-600/80 hover:underline ml-2"
            type="button"
            onClick={handleTestUser}
            disabled={loading}
          >
            Use test user
          </button>
        </div>
      </div>
    </div>
  );
}
