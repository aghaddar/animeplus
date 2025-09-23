"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login({ email, password })
      if (success) {
        console.log("Login successful, redirecting...")
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="main-page min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="login-container w-full max-w-md p-6 bg-[#1A1A1A] rounded-xl shadow-lg">

        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome To Animeplus</h1>
          <p className="text-[#5A5858] mt-1">Log in to your account</p>
        </header>

        {error && <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md mb-4">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#B3B3B3]">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#B3B3B3]">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-[10px] border border-[#3A3A3A] bg-[#2A2A2A] px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-[#B3B3B3]">
              <input type="checkbox" className="rounded accent-purple-600" />
              <span>Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-purple-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-[10px] transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm mt-4 text-[#B3B3B3]">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-purple-600 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Divider */}
        <div className="relative my-6">
          <hr className="border-[#3A3A3A]" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] px-2 text-sm text-[#B3B3B3] rounded">
            continue with
          </span>
        </div>

        {/* Social Login */}
        <div className="flex space-x-4">
          <button className="flex-1 py-2 border rounded-[10px] text-white hover:bg-gray-100 hover:text-black transition">Google</button>
          <button className="flex-1 py-2 rounded-[10px] bg-blue-500 text-white hover:bg-blue-600 transition">Facebook</button>
        </div>
      </div>
    </div>
  )

}
