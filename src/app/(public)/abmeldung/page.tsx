export default async function AbmeldungPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  const isError = fehler === "1";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center">
        {isError ? (
          <>
            <h1 className="font-headline text-2xl font-bold text-red-700 uppercase mb-4">
              Abmeldung nicht möglich
            </h1>
            <p className="text-gray-700 text-lg">
              Der Abmelde-Link ist ungültig oder wurde bereits verwendet.
              Falls du dich von einer Aktion abmelden möchtest, wende dich
              bitte direkt an die Ansprechperson.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-headline text-2xl font-bold text-tanne uppercase mb-4">
              Erfolgreich abgemeldet
            </h1>
            <p className="text-gray-700 text-lg">
              Du wurdest erfolgreich von der Aktion abgemeldet.
              Vielen Dank für dein Interesse!
            </p>
          </>
        )}
        <div className="mt-8">
          <a
            href="/"
            className="inline-block bg-tanne text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
          >
            Zurück zur Übersicht
          </a>
        </div>
      </div>
    </div>
  );
}
