"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset logic here
    console.log({ email })
    setIsSubmitted(true)
  }

  return (
    <div className="main-page min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="login-container w-full max-w-md p-6 bg-[#1A1A1A] rounded-xl shadow-lg">

        {/* Back to login */}
        <div className="mb-4">
          <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white">
            &larr; Back to login
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-[#5A5858] mt-1 text-sm">
            {isSubmitted
              ? "Check your email for reset instructions"
              : "Enter your email to receive password reset instructions"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#B3B3B3]">
                Email
              </label>
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

            <Button type="submit" className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-[10px] transition duration-200">
              Reset Password
            </Button>
          </form>
        ) : (
          <div className="bg-[#2A2A2A] p-4 rounded-lg text-center">
            <p className="text-white mb-4">
              If an account exists with <span className="text-purple-400">{email}</span>, you will receive password
              reset instructions.
            </p>
            <Button onClick={() => setIsSubmitted(false)} className="bg-purple-600 rounded-[10px] hover:bg-purple-700 text-white ">
              Try another email
            </Button>
          </div>
        )}

        
      </div>
    </div>
  )
}
