import type { FooterItem, MainNavItem } from "@/types"

import { productConfig } from "@/config/product"
import { slugify } from "@/lib/utils"

export type SiteConfig = typeof siteConfig

const links = {
  x: "https://twitter.com/intothedetails",
  github: "https://github.com/intothedetails",
  githubAccount: "https://github.com/intothedetails",
  discord: "https://discord.com/users/intothedetails",
  calDotCom: "https://cal.com/intothedetails",
}

export const siteConfig = {
  name: "In The Details",
  description:
    "An open source e-commerce store build with everything new in Next.js.",
  url: "https://intothedetails.net",
  ogImage: "https://intothedetails.net/opengraph-image.png",
  links,

  mainNav: [
    ...productConfig.categories.map((category) => ({

      title: category.name,
      items: [
        {
          title: "All",
          href: `/categories/${slugify(category.name)}`,
          description: `All ${category.name}.`,
          items: [],
        },
        ...category.subcategories.map((subcategory) => ({
          title: subcategory.name,
          href: `/categories/${slugify(category.name)}/${slugify(subcategory.name)}`,
          description: subcategory.description,
          items: [],
        })),
      ],
    })),
  ] satisfies MainNavItem[],
  footerNav: [
    {
      title: "Help",
      items: [
        {
          title: "About Us",
          href: "/about",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
        {
          title: "Terms and Conditions",
          href: "/terms",
          external: false,
        },
        {
          title: "Privacy Policy",
          href: "/privacy",
          external: false,
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          title: "Instagram",
          href: "https://www.instagram.com/inthedetails_decor",
          external: true,
        },
      ],
    },
  ] satisfies FooterItem[],
}
