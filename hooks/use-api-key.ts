"use client"

import { useState, useEffect, useCallback } from "react"

const API_KEY_STORAGE_KEY = "vocalmaster_api_key"
const ENCRYPTION_KEY_V1 = "vocalmaster_encryption_key_v1"
const ENCRYPTION_KEY_V2 = "vocalmaster_encryption_key_v2"
const USAGE_TRACKING_KEY = "vocalmaster_usage"

interface UsageStats {
  dailyRequests: number
  lastResetDate: string
  totalRequests: number
}

export function useApiKey() {
  const [hasValidKey, setHasValidKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

  useEffect(() => {
    checkApiKey()
    loadUsageStats()
  }, [])

  const checkApiKey = async () => {
    try {
      const encryptedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
      if (!encryptedKey) {
        setHasValidKey(false)
        setLoading(false)
        return
      }

      let decryptedKey: string | null = null

      // Try to determine the format and decrypt accordingly
      try {
        // First, try to detect if it's base64 encoded
        const decoded = atob(encryptedKey)
        const bytes = new Uint8Array(decoded.split("").map((char) => char.charCodeAt(0)))

        // Check if it has a version marker (V2 format)
        if (bytes.length > 0 && bytes[0] === 2) {
          console.log("Detected V2 format, attempting V2 decryption...")
          decryptedKey = await decryptApiKeyV2(encryptedKey)
        } else {
          console.log("No V2 marker detected, trying V1 format...")
          decryptedKey = await decryptApiKeyV1(encryptedKey)
        }
      } catch (formatError) {
        console.log("Format detection failed, trying both methods...")

        // If format detection fails, try both methods
        try {
          decryptedKey = await decryptApiKeyV2(encryptedKey)
          console.log("V2 decryption successful")
        } catch (v2Error: any) {
          console.log("V2 decryption failed:", v2Error.message)
          try {
            decryptedKey = await decryptApiKeyV1(encryptedKey)
            console.log("V1 decryption successful")

            // Migrate to V2 format
            if (decryptedKey) {
              console.log("Migrating to V2 format...")
              const newEncryptedKey = await encryptApiKeyV2(decryptedKey)
              localStorage.setItem(API_KEY_STORAGE_KEY, newEncryptedKey)
            }
          } catch (v1Error: any) {
            console.error("Both decryption methods failed:", {
              v2Error: v2Error.message,
              v1Error: v1Error.message,
              dataLength: encryptedKey.length,
            })

            // Clear the corrupted key
            localStorage.removeItem(API_KEY_STORAGE_KEY)
            setHasValidKey(false)
            setLoading(false)
            return
          }
        }
      }

      // Validate the decrypted key
      if (decryptedKey && decryptedKey.length > 10) {
        // Basic validation - check if it looks like an API key
        if (decryptedKey.startsWith("AIza") || decryptedKey.length > 20) {
          setHasValidKey(true)
        } else {
          console.warn("Decrypted key failed validation:", {
            length: decryptedKey.length,
            prefix: decryptedKey.substring(0, 4),
          })
          localStorage.removeItem(API_KEY_STORAGE_KEY)
          setHasValidKey(false)
        }
      } else {
        console.warn("Decrypted key is invalid or too short")
        localStorage.removeItem(API_KEY_STORAGE_KEY)
        setHasValidKey(false)
      }
    } catch (error) {
      console.error("Error checking API key:", error)
      // Clear any corrupted data
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      setHasValidKey(false)
    } finally {
      setLoading(false)
    }
  }

  const loadUsageStats = () => {
    try {
      const stats = localStorage.getItem(USAGE_TRACKING_KEY)
      if (stats) {
        const parsedStats = JSON.parse(stats)
        const today = new Date().toDateString()

        // Reset daily counter if it's a new day
        if (parsedStats.lastResetDate !== today) {
          parsedStats.dailyRequests = 0
          parsedStats.lastResetDate = today
          localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(parsedStats))
        }

        setUsageStats(parsedStats)
      } else {
        const initialStats: UsageStats = {
          dailyRequests: 0,
          lastResetDate: new Date().toDateString(),
          totalRequests: 0,
        }
        setUsageStats(initialStats)
        localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(initialStats))
      }
    } catch (error) {
      console.error("Error loading usage stats:", error)
    }
  }

  const saveApiKey = async (apiKey: string) => {
    try {
      // Validate API key format
      const trimmedKey = apiKey.trim()
      if (!trimmedKey || trimmedKey.length < 10) {
        throw new Error("Invalid API key format - too short")
      }

      // Use V2 encryption for all new keys
      const encryptedKey = await encryptApiKeyV2(trimmedKey)
      localStorage.setItem(API_KEY_STORAGE_KEY, encryptedKey)
      setHasValidKey(true)
      console.log("API key saved successfully with V2 encryption")
    } catch (error) {
      console.error("Error saving API key:", error)
      throw error
    }
  }

  const getApiKey = async (): Promise<string | null> => {
    try {
      const encryptedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
      if (!encryptedKey) return null

      // Try V2 first, then V1
      try {
        return await decryptApiKeyV2(encryptedKey)
      } catch (error) {
        console.log("V2 decryption failed in getApiKey, trying V1...")
        return await decryptApiKeyV1(encryptedKey)
      }
    } catch (error) {
      console.error("Error retrieving API key:", error)
      return null
    }
  }

  const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        return false
      }

      const result = await response.json()
      return result.valid === true
    } catch (error) {
      console.error("Error validating API key:", error)
      return false
    }
  }

  const trackUsage = useCallback(() => {
    try {
      const stats = localStorage.getItem(USAGE_TRACKING_KEY)
      if (stats) {
        const parsedStats = JSON.parse(stats)
        parsedStats.dailyRequests += 1
        parsedStats.totalRequests += 1
        localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(parsedStats))
        setUsageStats(parsedStats)
      }
    } catch (error) {
      console.error("Error tracking usage:", error)
    }
  }, [])

  const checkRateLimit = (): boolean => {
    if (!usageStats) return true
    const DAILY_LIMIT = 100
    return usageStats.dailyRequests < DAILY_LIMIT
  }

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    setHasValidKey(false)
  }

  return {
    hasValidKey,
    loading,
    usageStats,
    saveApiKey,
    getApiKey,
    validateApiKey,
    clearApiKey,
    trackUsage,
    checkRateLimit,
  }
}

// V2 Encryption with better error handling
async function encryptApiKeyV2(apiKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)

    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16))

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY_V2),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, data)

    // Format: [version(1)] + [salt(16)] + [iv(12)] + [encrypted data]
    const version = new Uint8Array([2])
    const combined = new Uint8Array(1 + 16 + 12 + encrypted.byteLength)
    combined.set(version, 0)
    combined.set(salt, 1)
    combined.set(iv, 17)
    combined.set(new Uint8Array(encrypted), 29)

    return btoa(String.fromCharCode(...combined))
  } catch (error: any) {
    console.error("V2 encryption failed:", error)
    throw new Error(`V2 encryption failed: ${error.message}`)
  }
}

async function decryptApiKeyV2(encryptedData: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )

    if (combined.length < 29) {
      throw new Error("Data too short for V2 format")
    }

    // Check version marker
    if (combined[0] !== 2) {
      throw new Error("Invalid V2 version marker")
    }

    // Extract components
    const salt = combined.slice(1, 17)
    const iv = combined.slice(17, 29)
    const encrypted = combined.slice(29)

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY_V2),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    )

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted)
    return decoder.decode(decrypted)
  } catch (error: any) {
    throw new Error(`V2 decryption failed: ${error.message}`)
  }
}

// V1 Decryption (Legacy support) - Simplified and more robust
async function decryptApiKeyV1(encryptedData: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )

    if (combined.length < 12) {
      throw new Error("Data too short for V1 format")
    }

    // V1 format: [iv(12)] + [encrypted data]
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY_V1),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("vocalmaster_salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    )

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted)
    return decoder.decode(decrypted)
  } catch (error: any) {
    throw new Error(`V1 decryption failed: ${error.message}`)
  }
}
