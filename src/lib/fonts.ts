import { Cormorant_Garamond, Outfit } from "next/font/google"
import { GeistMono } from "geist/font/mono"

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = GeistMono

export const fontHeading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading",
})
