# Release Process

Diese Anleitung beschreibt den kompletten Release-Prozess für die codfsh VS Code Extension.

## Voraussetzungen

### Personal Access Token (PAT) erstellen

Für die Veröffentlichung auf dem VS Code Marketplace wird ein Personal Access Token (PAT) benötigt.

**Wichtig:** Der PAT läuft nach einiger Zeit ab und muss dann neu erstellt werden.

#### PAT erstellen:

1. Unter https://dev.azure.com/gematikde einloggen
2. https://dev.azure.com/gematikde/_usersSettings/tokens aufrufen
3. Neuen Token erstellen mit folgenden Einstellungen:
   - **Organization:** gematikde
   - **Scopes:** Marketplace (Publish)
   - **Expiration:** Nach Bedarf (z.B. 90 Tage)
4. Token kopieren und sicher speichern (wird nur einmal angezeigt!)

### Weitere Voraussetzungen

- `@vscode/vsce` wird automatisch bei Bedarf installiert
- Build-Umgebung ist funktionsfähig (Node.js, npm)

## Release-Schritte

### 1. Version in package.json erhöhen

Entscheide welche Version als nächstes kommt:
- **x.x.1** - für Bugfixes (Patch)
- **x.1.0** - für neue Features (Minor)
- **2.0.0** - für Breaking Changes (Major)

```json
{
  "version": "1.1.0"
}
```

### 2. CHANGELOG.md aktualisieren

- Die `[Unreleased]` Sektion mit der neuen Version und Datum versehen
- Änderungen nach Kategorien dokumentieren:
  - **Added** - neue Features
  - **Changed** - Änderungen an bestehenden Features
  - **Fixed** - Bugfixes
  - **Removed** - entfernte Features
- Neue leere `[Unreleased]` Sektion für zukünftige Änderungen anlegen

Beispiel:
```markdown
## [Unreleased]

## [1.1.0] - 2025-11-25

### Added
- ANSI color rendering support for better output visualization

### Changed
- Updated dependencies for improved stability
```

### 3. Extension bauen

```bash
npm run vscode:prepublish
```

Dies führt automatisch den Produktions-Build aus.

### 4. Extension veröffentlichen

Mit deinem Personal Access Token:

```bash
npx @vscode/vsce publish -p <DEIN_PAT>
```

**Hinweis:** Wenn der PAT abgelaufen ist, erhältst du einen Fehler wie:
```
Access Denied: The Personal Access Token used has expired.
```
In diesem Fall: Neuen PAT erstellen (siehe oben) und erneut versuchen.

### 5. Git Commit und Tag erstellen

```bash
git add package.json CHANGELOG.md
git commit -m "Release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

## Nach dem Release

- Die Extension ist nach wenigen Minuten im Marketplace verfügbar
- URL: https://marketplace.visualstudio.com/items?itemName=gematikde.codfsh
- Management: https://marketplace.visualstudio.com/manage/publishers/gematikde/extensions/codfsh/hub

## Troubleshooting

### Icon-Fehler beim Publishing

Falls ein Fehler wie `The specified icon wasn't found` auftritt:
- Prüfe dass der Icon-Pfad in `package.json` relativ ist: `"icon": "images/icon.png"`
- Nicht `"icon": "./images/icon.png"`

### Engine-Warnungen

Die Warnungen zu `EBADENGINE` können ignoriert werden, solange der Build erfolgreich ist.

### Alternatives Publishing (ohne PAT im Terminal)

Falls du den PAT nicht im Terminal verwenden möchtest:

1. Paket lokal erstellen:
   ```bash
   npx @vscode/vsce package
   ```
2. Auf https://marketplace.visualstudio.com/manage/publishers/gematikde einloggen
3. Die erstellte `.vsix` Datei manuell hochladen
