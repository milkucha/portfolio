import type { SiteInfo } from "./types";

// Edit freely: this is the only place the intro and contact text live.
export const site: SiteInfo = {
  name: "Camilo Álvarez",
  tagline: "Developer · Python & Java · Product & UX background · Applied AI systems",
  bio: [
    "I'm a software developer working mainly in Python and Java. I started out in the social sciences, and building software satisfies the same craving I've always had for understanding complex systems.",
    "Right now I'm building a production backend for a vacation rental company I freelance for, maintaining an open-source Minecraft mod with over 550,000 downloads, and working on a proof of concept for a world-building tool that uses constrained AI agents to simulate culture.",
  ],
  contact: [
    { label: "GitHub", href: "https://github.com/milkucha", display: "github.com/milkucha" },
    { label: "Email", href: "mailto:milkucha@disroot.org", display: "milkucha@disroot.org" },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@milkuchachuklim",
      display: "@milkuchachuklim",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/camilo-alvarez-595292156/",
      display: "linkedin.com/in/camilo-alvarez-595292156",
    },
  ],
};
