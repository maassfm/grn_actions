export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-tanne uppercase mb-8">
        Datenschutzerklärung
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <p>
            Diese Datenschutzerklärung gilt für die Aktionsplattform unter{" "}
            <strong>aktionen.gruene-mitte.de</strong> und ergänzt die{" "}
            <a
              href="https://gruene-mitte.de/datenschutzerklaerung"
              className="text-tanne underline hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              allgemeine Datenschutzerklärung
            </a>{" "}
            von BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte. Soweit nicht
            hier abweichend geregelt, gelten die Bestimmungen der allgemeinen
            Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Verantwortliche Stelle
          </h2>
          <p>
            BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte<br />
            E-Mail: datenschutz@gruene-mitte.de
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Erhebung und Verarbeitung personenbezogener Daten
          </h2>
          <p>
            Bei der Anmeldung zu Wahlkampfaktionen werden folgende Daten
            erhoben:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Vorname und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>Telefonnummer (optional)</li>
            <li>Signal-Name (optional)</li>
          </ul>
          <p className="mt-2">
            Die Angabe von Vorname, Nachname und E-Mail-Adresse ist für die
            Anmeldung erforderlich. Telefonnummer und Signal-Name sind freiwillig
            und dienen der erleichterten Koordination vor Ort.
          </p>
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
            <li>
              Koordination der Aktionen durch die zuständigen
              Ansprechpersonen
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            E-Mail-Versand
          </h2>
          <p>
            Nach der Anmeldung werden automatisch transaktionale E-Mails
            versendet. Der Versand erfolgt von der Adresse{" "}
            <strong>aktionen@gruene-mitte.de</strong> (Kreisvorstand B90/GRÜNE
            Berlin-Mitte) über einen gesicherten SMTP-Server. Folgende
            E-Mail-Typen können versendet werden:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Anmeldebestätigung nach erfolgreicher Registrierung</li>
            <li>Benachrichtigung bei Änderungen einer Aktion (Ort, Zeit etc.)</li>
            <li>Absagebenachrichtigung bei Stornierung einer Aktion</li>
            <li>
              Tägliche Zusammenfassung der Anmeldungen für
              Aktionsverantwortliche (nur interne Nutzer*innen)
            </li>
          </ul>
          <p className="mt-2">
            Alle versendeten E-Mails werden zu Nachvollziehbarkeitszwecken
            protokolliert (Zeitstempel, Empfängeradresse, Status).
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Rechtsgrundlage
          </h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6
            Abs. 1 lit. a DSGVO), die du durch das Setzen des Häkchens im
            Anmeldeformular erteilst. Du kannst deine Einwilligung jederzeit
            widerrufen.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-tanne uppercase mb-3">
            Speicherdauer und Datenlöschung
          </h2>
          <p>
            Personenbezogene Anmeldedaten werden automatisch{" "}
            <strong>72 Stunden nach Ende der jeweiligen Aktion</strong> gelöscht.
            Anschließend werden ausschließlich anonymisierte Gesamtzahlen
            (Anzahl der Anmeldungen pro Aktion) zu statistischen Zwecken
            gespeichert. Ein Rückschluss auf einzelne Personen ist danach nicht
            mehr möglich.
          </p>
          <p className="mt-2">
            Accounts für Wahlkampfexpert*innen und Administrator*innen werden
            nach Abschluss der Wahlperiode deaktiviert und die zugehörigen
            personenbezogenen Daten gelöscht.
          </p>
          <p className="mt-2">
            E-Mail-Protokolleinträge werden nach Ablauf der jeweiligen
            Aufbewahrungsfrist ebenfalls gelöscht.
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
            Bei Fragen zum Datenschutz wende dich an:{" "}
            <a
              href="mailto:datenschutz@gruene-mitte.de"
              className="text-tanne underline hover:opacity-80"
            >
              datenschutz@gruene-mitte.de
            </a>
          </p>
          <p className="mt-2">
            Weitere Informationen zum Datenschutz findest du in unserer{" "}
            <a
              href="https://gruene-mitte.de/datenschutzerklaerung"
              className="text-tanne underline hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              allgemeinen Datenschutzerklärung
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
