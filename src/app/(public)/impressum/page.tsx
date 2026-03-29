export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-tanne uppercase mb-8">
        Impressum
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte<br />
            Tegeler Straße 31<br />
            13353 Berlin <br />
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Kontakt
          </h2>
          <p>
            E-Mail: info@gruene-mitte.de<br />
            Website: www.gruene-mitte.de
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p>
            Kreisvorstand BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte<br />
            Tegeler Straße 31<br />
            13353 Berlin
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Haftungsausschluss
          </h2>
          <p>
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
            für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind
            ausschließlich deren Betreiber verantwortlich.
          </p>
        </section>
      </div>
    </div>
  );
}
