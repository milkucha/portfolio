import type { Metadata, Viewport } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7ece1",
  colorScheme: "light",
};

export default function DatenschutzPage() {
  return (
    <LegalShell title="Datenschutz">
      <section>
        <h2>Controller</h2>
        <p>
          Camilo Álvarez
          <br />
          Ueckermünderstrasse 1, 10439 Berlin
          <br />
          Germany
          <br />
          Email: milkucha@disroot.org
        </p>
      </section>
      <section>
        <h2>Hosting</h2>
        <p>
          This site is hosted by Vercel Inc., USA. When you visit the site, the host processes server log
          data such as your IP address. This site sets no cookies and uses no tracking, analytics or
          counters. It has no forms.
        </p>
      </section>
      <section>
        <h2>Purpose and legal basis</h2>
        <p>
          The processing described above serves to provide and secure the website. The legal basis is
          Art. 6(1)(f) GDPR, our legitimate interest in providing and securing the website.
        </p>
      </section>
      <section>
        <h2>External links</h2>
        <p>
          This site links to GitHub, itch.io, YouTube, LinkedIn, Modrinth and CurseForge. Once you follow
          such a link, the privacy policy of that provider applies.
        </p>
      </section>
      <section>
        <h2>Fonts</h2>
        <p>
          Fonts are loaded via next/font and served from the same origin as this site. Your browser does
          not request them from Google.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          You have the rights of access, rectification, erasure, restriction, data portability and
          objection under Art. 15 to 21 GDPR. Where processing is based on consent, you can revoke it at
          any time.
        </p>
      </section>
      <section>
        <h2>Right to complain</h2>
        <p>
          You can lodge a complaint with a supervisory authority. For Berlin this is the Berliner
          Beauftragte für Datenschutz und Informationsfreiheit.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>For questions about data protection, write to milkucha@disroot.org.</p>
      </section>
    </LegalShell>
  );
}
