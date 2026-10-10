import type { IconType } from "react-icons";
import { FaEnvelope, FaGithub, FaYoutube } from "react-icons/fa6";
import { SiModrinth } from "react-icons/si";
import { site } from "@/data/site";
import type { ContactIcon } from "@/data/types";

const icons: Record<ContactIcon, IconType> = {
  github: FaGithub,
  email: FaEnvelope,
  youtube: FaYoutube,
  modrinth: SiModrinth,
};

/** Mirrors the old site's #contact: full-height rose section, one big black icon per channel. */
export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="flex min-h-[calc(100svh-3.5rem)] scroll-mt-14 items-center justify-center bg-quinary px-4"
    >
      <h2 id="contact-title" className="sr-only">
        Contact
      </h2>
      <ul className="flex flex-wrap items-center justify-center">
        {site.contact.map((c) => {
          const Icon = icons[c.icon];
          const external = c.href.startsWith("http");
          return (
            <li key={c.href}>
              <a
                href={c.href}
                aria-label={c.label}
                title={c.display}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block rounded px-2 text-[4rem] text-primary transition-colors hover:text-tertiary focus-visible:text-tertiary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary sm:px-4 sm:text-[5.25rem]"
              >
                <Icon aria-hidden="true" focusable="false" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
