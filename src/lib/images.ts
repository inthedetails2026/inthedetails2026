import type { StoredFile } from "@/types"

export function safeParseImages(images: unknown): StoredFile[] | null {
  if (Array.isArray(images)) {
    return images as StoredFile[]
  }

  if (typeof images === "string" && images.length > 0) {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        return parsed as StoredFile[]
      }
    } catch {
      return null
    }
  }

  return null
}
