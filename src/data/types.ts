/** Category of a tech node. Mirrors the tag scheme in the Obsidian vault's concepts/ notes. */
export type TechCategory = "language" | "framework" | "tool" | "data-format" | "technique";

export interface Tech {
  id: string;
  label: string;
  category: TechCategory;
  /** Optional one-line gloss shown in the tech card. */
  note?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  /** Short label drawn on the graph node. */
  label: string;
  /** Full name used in cards and the accessible list. */
  name: string;
  oneLiner: string;
  highlights: string[];
  status: string;
  /** Ids of the Tech nodes this project uses. Defines the graph's links. */
  stack: string[];
  links: ProjectLink[];
  /** Smaller node, e.g. for this site itself. */
  minor?: boolean;
}

/** Which icon the contact section draws for a link. */
export type ContactIcon = "github" | "email" | "youtube" | "modrinth";

export interface ContactLink {
  /** Accessible name of the icon link, e.g. "GitHub". */
  label: string;
  icon: ContactIcon;
  href: string;
  /** Text shown, e.g. a handle or address. */
  display: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  /** Short placeholder bio, one string per paragraph. */
  bio: string[];
  contact: ContactLink[];
}

/** A link in the graph: always project -> tech. */
export interface GraphLink {
  source: string;
  target: string;
}
