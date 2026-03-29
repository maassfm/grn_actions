export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-tanne uppercase mb-8">
        Datenschutzerklärung
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Verantwortliche Stelle
          </h2>
          <p>
            BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte<br />
            Tegeler Straße 31<br />
            13353 Berlin <br />
            E-Mail: info@gruene-mitte.de
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>
            Bei der Anmeldung zu Wahlkampfaktionen werden folgende Daten erhoben:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Vorname und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>Telefonnummer (Alternativ Signal-Nutzername)</li>
            <li>Signal-Name (optional als Alternative zur Telefonnummer)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Zweck der Datenverarbeitung
          </h2>
          <p>
            Die erhobenen Daten werden ausschließlich zur Koordination von
            Wahlkampfaktionen verwendet. Dies umfasst:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Bestätigung der Anmeldung per E-Mail</li>
            <li>Benachrichtigung bei Änderungen oder Absagen von Aktionen</li>
            <li>Koordination der Aktionen durch die zuständigen Ansprechpersonen</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Rechtsgrundlage
          </h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO),
            die du durch das Setzen des Häkchens im Anmeldeformular erteilst.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Löschung der Daten
          </h2>
          <p>
            Deine Anmeldedaten (Vorname, Nachname, E-Mail-Adresse, Telefonnummer, Signal-Name) werden
            72 Stunden nach Ende der jeweiligen Aktion automatisch gelöscht. Anschließend werden
            ausschließlich anonymisierte Gesamtzahlen (Anzahl der Anmeldungen pro Aktion) zu
            statistischen Zwecken gespeichert. Ein Rückschluss auf einzelne Personen ist danach
            nicht mehr möglich.
          </p>
          <p className="mt-3">
            Alle anderen personenbezogenen Daten (Nutzer-Accounts der Expert*innen und
            Administrator*innen, Team-Zuordnungen) werden spätestens am 31. Oktober 2026 gelöscht.
          </p>
          <p className="mt-3">
            Die anonymisierten statistischen Daten (Anzahl Anmeldungen pro Aktion) werden ebenfalls
            spätestens am 31. Oktober 2026 gelöscht.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Deine Rechte
          </h2>
          <p>Du hast das Recht auf:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Auskunft über die zu deiner Person gespeicherten Daten</li>
            <li>Berichtigung unrichtiger Daten</li>
            <li>Löschung deiner Daten</li>
            <li>Einschränkung der Verarbeitung</li>
            <li>Widerruf deiner Einwilligung</li>
            <li>Selbstabmeldung von Aktionen über den Link in deiner Bestätigungs-E-Mail</li>
            <li>Beschwerde bei einer Aufsichtsbehörde</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Cookies
          </h2>
          <p>
            Diese Website verwendet keine Tracking-Cookies. Lediglich ein
            technisch notwendiger Session-Cookie wird für eingeloggte
            Expert*innen und Administrator*innen gesetzt.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Kontakt
          </h2>
          <p>
            Bei Fragen zum Datenschutz wende dich an: info@gruene-mitte.de
          </p>
        </section>
      </div>
    </div>
  );
}
