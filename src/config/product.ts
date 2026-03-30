import type { Category, Subcategory } from "@/db/schema"

import { generateId } from "@/lib/id"

export type ProductConfig = typeof productConfig

export const productConfig = {
  categories: [
    {
      id: "cat_lighting",
      name: "Lighting",
      description: "Illuminate your space with our premium lighting collection.",
      image: "/images/categories/lighting.png",
      subcategories: [
        {
          id: "sub_lamps",
          name: "Lamps",
          description: "Table and floor lamps for every room.",
        },
        {
          id: "sub_ceiling_lights",
          name: "Ceiling Lights",
          description: "Chandeliers and pendants to brighten your home.",
        },
        {
          id: "sub_light_accessories",
          name: "Light Accessories",
          description: "Smart bulbs, shades, and lighting accessories.",
        },
      ],
    },
    {
      id: "cat_furniture",
      name: "Furniture",
      description: "Experience the perfect blend of comfort and style with our modern furniture collection.",
      image: "/images/categories/furniture.png",
      subcategories: [
        {
          id: "sub_couches",
          name: "Couches",
          description: "Cozy sofas and sectionals.",
        },
        {
          id: "sub_chairs",
          name: "Chairs",
          description: "Accent chairs, recliners, and dining seating.",
        },
        {
          id: "sub_tables",
          name: "Tables",
          description: "Coffee tables, dining tables, and side tables.",
        },
        {
          id: "sub_dividers",
          name: "Dividers",
          description: "Elegant room dividers and partitions.",
        },
      ],
    },
    {
      id: "cat_decor",
      name: "Decor",
      description: "Complete your home's story with our unique and artistic decor accents.",
      image: "/images/categories/decor.png",
      subcategories: [
        {
          id: "sub_key_stands",
          name: "Key Stands",
          description: "Stylish organizers for your entryway.",
        },
        {
          id: "sub_vases",
          name: "Vases",
          description: "Ceramic and glass vases for fresh arrangements.",
        },
        {
          id: "sub_mirrors",
          name: "Mirrors",
          description: "Wall and floor mirrors to expand your space.",
        },
        {
          id: "sub_wall_art",
          name: "Wall Art",
          description: "Paintings, prints, and wall decor.",
        },
        {
          id: "sub_rugs",
          name: "Rugs",
          description: "Plush area rugs and runners.",
        },
      ],
    },
    {
      id: "cat_outdoor_decor",
      name: "Outdoor Decor",
      description: "Transform your exterior into a private oasis with our beautiful outdoor collection.",
      image: "/images/categories/outdoor-decor.png",
      subcategories: [
        {
          id: "sub_garden_accessories",
          name: "Garden Accessories",
          description: "Pots, lanterns, and garden decorations.",
        },
        {
          id: "sub_outdoor_furniture",
          name: "Outdoor Furniture",
          description: "Durable and stylish furniture for the outdoors.",
        },
        {
          id: "sub_outdoor_lighting",
          name: "Outdoor Lighting",
          description: "Illuminate your garden with eco-friendly lights.",
        },
      ],
    },
  ] satisfies ({
    subcategories: Omit<
      Subcategory,
      "slug" | "categoryId" | "createdAt" | "updatedAt"
    >[]
  } & Pick<Category, "id" | "name" | "description" | "image">)[],
}
