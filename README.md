# Aktionskoordination - BÜNDNIS 90/DIE GRÜNEN Berlin-Mitte

Wahlkampf-Koordinationsplattform für den Kreisverband Berlin-Mitte. Ermöglicht die Verwaltung von Wahlkampfaktionen, Freiwilligen-Anmeldungen, Excel-Import/Export und automatische E-Mail-Benachrichtigungen.

## Tech-Stack

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Sprache:** TypeScript
- **Datenbank:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials Provider, JWT)
- **Styling:** Tailwind CSS v4 (Corporate Design Grüne)
- **Karten:** Leaflet + React-Leaflet (OpenStreetMap)
- **E-Mail:** Resend
- **Excel:** SheetJS (xlsx)

## Funktionen

- **Öffentliche Aktionsübersicht** mit Karte, Filtern (Wahlkreis, Datum, Tageszeit) und Sammelanmeldung
- **Freiwilligen-Registrierung** mit DSGVO-konformer Einwilligung und Honeypot-Spamschutz
- **Expert-Dashboard** zur Verwaltung von Team-Aktionen (CRUD, Status-Änderungen)
- **Excel-Upload** mit Validierung, Vorschau und automatischem Geocoding
- **Admin-Bereich** für Benutzer-, Team- und Wahlkreis-Verwaltung
- **E-Mail-System** (Bestätigung, Änderung, Absage, tägliche Übersicht)
- **Export** als Excel oder Signal-Textformat

---

## Lokale Entwicklung mit DDEV

### Voraussetzungen

- [DDEV](https://ddev.readthedocs.io/en/stable/) (v1.23+)
- [Docker](https://docs.docker.com/get-docker/) oder [OrbStack](https://orbstack.dev/) (macOS)

### 1. Repository klonen

```bash
git clone <repository-url>
cd grn_actions
```

### 2. DDEV-Projekt konfigurieren

```bash
ddev config --project-type=generic --docroot=. --webserver-type=nginx-fpm
```

Alternativ die mitgelieferte Konfiguration verwenden — die Datei `.ddev/config.yaml` sollte bereits vorhanden sein (siehe unten). Falls nicht, erstelle sie:

```yaml
# .ddev/config.yaml
name: gruene-aktionen
type: generic
docroot: ""
php_version: ""
webserver_type: generic
database:
  type: postgres
  version: "16"
nodejs_version: "22"
web_extra_exposed_ports:
  - name: nextjs
    container_port: 3000
    http_port: 3000
    https_port: 3001
hooks:
  post-start:
    - exec: "npm install"
    - exec: "npx prisma generate"
```

### 3. DDEV starten

```bash
ddev start
```

DDEV startet automatisch einen PostgreSQL-Container und installiert Node.js 22.

### 4. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Die `.env`-Datei mit der DDEV-Datenbank-URL anpassen:

```env
DATABASE_URL=postgresql://db:db@db:5432/db
NEXTAUTH_SECRET=ein-zufaelliger-string-mindestens-32-zeichen
NEXTAUTH_URL=https://gruene-aktionen.ddev.site:3001
RESEND_API_KEY=
EMAIL_FROM=noreply@localhost
CRON_SECRET=ein-geheimer-cron-token
```

> **Hinweis:** In DDEV ist der PostgreSQL-Host `db`, Benutzer `db`, Passwort `db`, Datenbank `db`. Für lokale Entwicklung ohne E-Mail-Versand kann `RESEND_API_KEY` leer bleiben.

### 5. Datenbank-Migration und Seed

```bash
ddev exec npx prisma migrate dev --name init
ddev exec npx prisma db seed
```

### 6. Entwicklungsserver starten

```bash
ddev exec npm run dev
```

Die App ist erreichbar unter:

- **https://gruene-aktionen.ddev.site:3001** (HTTPS via DDEV-Router)
- **http://localhost:3000** (direkt, wenn Port 3000 exposed)

### Test-Zugangsdaten

| Rolle  | E-Mail                     | Passwort     |
|--------|----------------------------|--------------|
| Admin  | admin@gruene-mitte.de      | admin1234    |
| Expert | expert@gruene-mitte.de     | expert1234   |

### Nützliche DDEV-Befehle

```bash
# DDEV-Status prüfen
ddev status

# In den Container wechseln
ddev ssh

# Prisma Studio (DB-Browser)
ddev exec npx prisma studio

# Linting
ddev exec npm run lint

# Production-Build testen
ddev exec npm run build

# Datenbank zurücksetzen
ddev exec npx prisma migrate reset

# PostgreSQL-CLI
ddev psql

# DDEV stoppen
ddev stop

# DDEV komplett entfernen (inkl. Datenbank)
ddev delete -O
```

---

## Production-Deployment auf Hetzner

### Server-Anforderungen

- **Hetzner Cloud:** CX22 (2 vCPU, 4 GB RAM) oder größer
- **OS:** Ubuntu 24.04 LTS
- **Domain:** z.B. `aktionen.gruene-mitte.de` (A-Record auf Server-IP zeigend)

### 1. Server vorbereiten

```bash
# Als root auf dem Server
apt update && apt upgrade -y

# Node.js 22 LTS installieren
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# PostgreSQL installieren
apt install -y postgresql postgresql-contrib

# Nginx als Reverse-Proxy
apt install -y nginx certbot python3-certbot-nginx

# Git installieren (falls nicht vorhanden)
apt install -y git
```

### 2. Datenbank einrichten

```bash
sudo -u postgres psql
```

```sql
CREATE USER gruene WITH PASSWORD 'SICHERES_PASSWORT_HIER';
CREATE DATABASE gruene_aktionen OWNER gruene;
GRANT ALL PRIVILEGES ON DATABASE gruene_aktionen TO gruene;
\q
```

### 3. Anwendung deployen

```bash
# App-Benutzer erstellen
adduser --disabled-password gruene
su - gruene

# Repository klonen
git clone <repository-url> ~/app
cd ~/app

# Dependencies installieren
npm ci --production=false
```

### 4. Umgebungsvariablen setzen

```bash
nano ~/app/.env
```

```env
DATABASE_URL=postgresql://gruene:SICHERES_PASSWORT_HIER@localhost:5432/gruene_aktionen
NEXTAUTH_SECRET=HIER_GENERIERTER_WERT
NEXTAUTH_URL=https://aktionen.gruene-mitte.de
RESEND_API_KEY=re_DEIN_API_KEY
EMAIL_FROM=aktionen@gruene-mitte.de
CRON_SECRET=HIER_GENERIERTER_WERT
NODE_ENV=production
```

Secrets generieren:

```bash
# Einmalig ausführen und Ausgabe in .env eintragen
openssl rand -base64 32   # für NEXTAUTH_SECRET
openssl rand -hex 16      # für CRON_SECRET
```

### 5. Datenbank-Migration

```bash
npx prisma migrate deploy
npx prisma db seed
```

> **Achtung:** Nach dem ersten Deployment unbedingt das Admin-Passwort über die Admin-Oberfläche ändern!

### 6. Build erstellen

```bash
npm run build
```

### 7. Systemd-Service einrichten

Als root:

```bash
cat > /etc/systemd/system/gruene-aktionen.service << 'EOF'
[Unit]
Description=Grüne Aktionskoordination
After=network.target postgresql.service

[Service]
Type=simple
User=gruene
WorkingDirectory=/home/gruene/app
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gruene-aktionen
systemctl start gruene-aktionen
```

Logs prüfen:

```bash
journalctl -u gruene-aktionen -f
```

### 8. Nginx Reverse-Proxy konfigurieren

```bash
cat > /etc/nginx/sites-available/gruene-aktionen << 'NGINX'
server {
    server_name aktionen.gruene-mitte.de;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    client_max_body_size 10M;
}
NGINX

ln -s /etc/nginx/sites-available/gruene-aktionen /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 9. SSL-Zertifikat (Let's Encrypt)

```bash
certbot --nginx -d aktionen.gruene-mitte.de
```

Certbot richtet automatische Erneuerung ein. Prüfen:

```bash
certbot renew --dry-run
```

### 10. Cron-Job für tägliche Übersicht

```bash
# Als root
crontab -e
```

Folgende Zeile hinzufügen (tägliche Übersichts-E-Mail um 21:00 Uhr):

```cron
0 21 * * * curl -s -H "Authorization: Bearer DEIN_CRON_SECRET" http://127.0.0.1:3000/api/cron/daily-summary > /dev/null 2>&1
```

### 11. Firewall konfigurieren

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Updates deployen

```bash
su - gruene
cd ~/app
git pull origin main

npm ci --production=false
npx prisma migrate deploy
npm run build
```

Als root:

```bash
systemctl restart gruene-aktionen
```

### Automatisiertes Deployment (optional)

Ein einfaches Deploy-Script unter `/home/gruene/deploy.sh`:

```bash
#!/bin/bash
set -e

cd /home/gruene/app
echo "$(date): Deployment gestartet..."

git pull origin main
npm ci --production=false
npx prisma migrate deploy
npm run build

sudo systemctl restart gruene-aktionen
echo "$(date): Deployment abgeschlossen."
```

```bash
chmod +x /home/gruene/deploy.sh
```

---

## Backup

### Datenbank-Backup (täglich per Cron)

```bash
# /home/gruene/backup.sh
#!/bin/bash
BACKUP_DIR="/home/gruene/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U gruene gruene_aktionen | gzip > "$BACKUP_DIR/gruene_aktionen_$TIMESTAMP.sql.gz"

# Backups älter als 30 Tage löschen
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /home/gruene/backup.sh

# Crontab: täglich um 03:00 Uhr
echo "0 3 * * * /home/gruene/backup.sh" | crontab -u gruene -
```

---

## Umgebungsvariablen

| Variable          | Beschreibung                              | Beispiel                                        |
|-------------------|-------------------------------------------|-------------------------------------------------|
| `DATABASE_URL`    | PostgreSQL-Verbindungsstring              | `postgresql://user:pass@localhost:5432/dbname`   |
| `NEXTAUTH_SECRET` | Geheimer Schlüssel für JWT-Signierung     | `openssl rand -base64 32`                        |
| `NEXTAUTH_URL`    | Öffentliche URL der App                   | `https://aktionen.gruene-mitte.de`               |
| `RESEND_API_KEY`  | API-Key von resend.com für E-Mail-Versand | `re_xxxxxxxx`                                    |
| `EMAIL_FROM`      | Absender-Adresse für E-Mails              | `aktionen@gruene-mitte.de`                       |
| `CRON_SECRET`     | Bearer-Token für Cron-API-Endpunkt        | `openssl rand -hex 16`                           |

---

## Projektstruktur

```
├── .ddev/
│   └── config.yaml           # DDEV-Konfiguration
├── prisma/
│   ├── schema.prisma         # Datenmodell
│   └── seed.ts               # Testdaten
├── public/                   # Statische Dateien
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login-Seiten
│   │   ├── (public)/         # Öffentliche Seiten (Aktionen, Datenschutz)
│   │   ├── (protected)/      # Dashboard & Admin (authentifiziert)
│   │   └── api/              # API-Routen (Cron, Export, Upload)
│   ├── components/
│   │   ├── ui/               # Wiederverwendbare UI-Komponenten
│   │   ├── dashboard/        # Dashboard-Komponenten
│   │   ├── public/           # Öffentliche Komponenten
│   │   └── map/              # Karten-Komponenten
│   └── lib/
│       ├── email/            # E-Mail-Templates und Versand
│       ├── excel/            # Excel-Import/Export
│       ├── export/           # Datenexport (Excel, Signal-TXT)
│       └── validations/      # Zod-Schemas
├── .env.example
├── next.config.ts
└── package.json
```

---

## Lizenz

Intern - BÜNDNIS 90/DIE GRÜNEN Kreisverband Berlin-Mitte
