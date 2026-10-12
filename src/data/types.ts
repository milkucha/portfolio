export interface ContactLink {
  label: string;
  /** Omitted for a plain-text row (e.g. a location). */
  href?: string;
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
