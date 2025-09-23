"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const success = await register({ username, email, password })
      if (success) {
        console.log("Registration successful, redirecting...")
        router.push("/")
      } else {
        setError("Registration failed. Please try different credentials.")
      }
    } catch (err: any) {
      console.error("Registration error:", err)

      if (
        err.message?.includes("already exists") ||
        err.message?.includes("already in use") ||
        err.message?.includes("already registered")
      ) {
        setError("This email is already registered. Please try logging in instead.")
      } else if (err.message?.includes("password")) {
        setError("Password doesn't meet requirements. Try a stronger password with at least 6 characters.")
      } else if (err.message?.includes("email") || err.message?.includes("Email")) {
        setError("Please provide a valid email address.")
      } else {
        setError(err.message || "Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="main-page min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="login-container w-full max-w-md p-6 bg-[#1A1A1A] rounded-xl shadow-lg">

        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Join Animeplus</h1>
          <p className="text-[#5A5858] mt-1">create your new account</p>
        </header>

        {error && <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md mb-4">{error}</div>}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#B3B3B3]">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#B3B3B3]">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#B3B3B3]">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#B3B3B3]">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div></div>
            <Link href="/auth/login" className="text-purple-600 hover:underline">Already have an account?</Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-[10px] transition duration-200">
            {isLoading ? "Signing up..." : "Create account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <hr className="border-[#3A3A3A]" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] px-2 text-sm text-[#B3B3B3] rounded">continue with</span>
        </div>

        {/* Social Login (optional) */}
        <div className="flex space-x-4">
          <button className="flex-1 py-2 border rounded-[10px] text-white hover:bg-gray-100 hover:text-black transition">Google</button>
          <button className="flex-1 py-2 rounded-[10px] bg-blue-500 text-white hover:bg-blue-600 transition">Facebook</button>
        </div>
      </div>
    </div>
  )
}
