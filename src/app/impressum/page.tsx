import type { Metadata, Viewport } from "next";
import { LegalShell } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7ece1",
  colorScheme: "light",
};

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <section>
        <h2>Provider information (section 5 DDG)</h2>
        <p>
          Camilo Álvarez
          <br />
          [Street and number]
          <br />
          [Postcode] Berlin
          <br />
          Germany
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Email: milkucha@disroot.org
          <br />
          Phone: [Phone, optional]
        </p>
      </section>
      <section>
        <h2>Responsible for content</h2>
        <p>
          Camilo Álvarez, address as above.
        </p>
      </section>
    </LegalShell>
  );
}
