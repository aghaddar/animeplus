// API client for authentication operations

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:3001"

// Interface for login response
export interface LoginResponse {
  message?: string
  token: string
  user?: UserData
}

// Interface for user data
export interface UserData {
  user_id?: number
  id?: number
  username: string
  email: string
  avatar_url?: string
  profile_url?: string
}

// Interface for registration response
export interface RegisterResponse {
  message: string
  user: UserData
  token?: string
}

// Interface for profile update
export interface ProfileUpdateData {
  username?: string
  profile_url?: string
}

// Interface for password change
export interface PasswordChangeData {
  old_password: string
  new_password: string
}

// Login user
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Login failed with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Register user
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Registration error response:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || `Registration failed with status: ${response.status}`)
      } catch (e) {
        throw new Error(`Registration failed with status: ${response.status}. Response: ${errorText}`)
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Get user profile
export async function getUserProfile(userId: number, token: string): Promise<UserData> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Prevent caching to always get fresh data
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to fetch user profile with status: ${response.status}`)
    }

    const userData = await response.json()

    // Transform profile_url to be URL-compatible
    let profileUrl = userData.user?.profile_url
    if (profileUrl && !profileUrl.startsWith("http") && !profileUrl.startsWith("data:")) {
      // If it's a base64 string, convert it to a data URL
      profileUrl = `data:image/jpeg;base64,${profileUrl}`
    } else if (profileUrl?.startsWith("uploads/")) {
      // If it's a relative path, make it absolute
      profileUrl = `${API_BASE_URL}/${profileUrl}`
    }

    return {
      ...userData,
      user: {
        ...userData.user,
        profile_url: profileUrl,
      },
    }
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(token: string, data: ProfileUpdateData): Promise<UserData> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // If the endpoint returns 404, it might not be implemented yet
      if (response.status === 404) {
        console.warn("Profile update endpoint not found, storing data locally only")

        // Get the current user from localStorage
        const storedUser = localStorage.getItem("auth_user")
        if (!storedUser) {
          throw new Error("User data not found in local storage")
        }

        const userData = JSON.parse(storedUser)

        // Update the user data
        const updatedUser = {
          ...userData,
          username: data.username || userData.username,
          avatarURL: data.profile_url || userData.avatarURL,
        }

        // Save the updated user data to localStorage
        localStorage.setItem("auth_user", JSON.stringify(updatedUser))

        return updatedUser
      }

      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to update profile with status: ${response.status}`)
    }

    const userData = await response.json()

    // Update local storage with the new data
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      const updatedUser = {
        ...parsedUser,
        username: userData.username || data.username || parsedUser.username,
        avatarURL: userData.profile_url || userData.avatar_url || data.profile_url || parsedUser.avatarURL,
      }
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    }

    return userData
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

// Upload profile picture (converts to base64 and sends as text)
export async function uploadProfilePicture(token: string, file: File): Promise<{ profile_url: string }> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

    // Update the profile with the base64 image
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile_url: base64, // Send the full base64 string as profile_url
      }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Profile update endpoint not found, storing image locally only")
        return { profile_url: base64 }
      }

      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to upload profile picture with status: ${response.status}`)
    }

    const userData = await response.json()

    // Get the profile URL from the response or use the base64 as fallback
    const profileUrl = userData.profile_url || userData.avatar_url || base64

    // Update the user data in localStorage to ensure persistence
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        parsedUser.avatarURL = profileUrl
        localStorage.setItem("auth_user", JSON.stringify(parsedUser))
      } catch (e) {
        console.error("Failed to update localStorage with new profile picture", e)
      }
    }

    return { profile_url: profileUrl }
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    throw error
  }
}

// Change password
export async function changePassword(token: string, data: PasswordChangeData): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to change password with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

// Parse JWT token to get user ID
export function parseJwt(token: string): { user_id: string; role: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing JWT:", error)
    return null
  }
}
