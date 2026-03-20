export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-headline text-3xl font-bold text-tanne uppercase mb-8">
        Impressum
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-4 text-gray-700 leading-relaxed">
        <p>
          Diese Plattform wird betrieben von BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte.
        </p>
        <p>
          Das vollständige Impressum findest du auf unserer Hauptwebsite:{" "}
          <a
            href="https://gruene-mitte.de/impressum"
            className="text-tanne underline hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            gruene-mitte.de/impressum
          </a>
        </p>
      </div>
    </div>
  );
}
