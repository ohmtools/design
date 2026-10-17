# ohmtools design

> **Hinweis:** Dieses Projekt wurde größtenteils mit KI generiert: Code,
> Konfiguration und Dokumentation sind mit
> [Claude Code](https://claude.com/claude-code) entstanden.

Ein Erscheinungsbild für alle Apps, Webseiten und Dokumente von ohmtools:
shadcn/ui `base-sera` mit dem Theme Red auf Neutral, Inter, eckige Ecken,
keine Boxen, Rot als einzige Akzentfarbe, hell und dunkel nach Einstellung des
Geräts. Die Regeln stehen in [DESIGN.md](DESIGN.md), die Werte in
[`tokens/`](tokens/) (Design-Token-Format, Farben in OKLCH); alles andere wird
daraus erzeugt. Referenzumsetzung:
[zeiteisen](https://github.com/ohmtools/zeiteisen).

| Pfad | Inhalt |
| --- | --- |
| [`DESIGN.md`](DESIGN.md) | Die Regeln und alle Farben als Tabelle |
| [`tokens/`](tokens/) | Quelle aller Werte ([DTCG](https://www.designtokens.org)-JSON) |
| [`shadcn/components.json`](shadcn/components.json) | shadcn-Konfiguration |
| [`shadcn/index.css`](shadcn/index.css) | `src/index.css` einer shadcn-App (erzeugt) |
| [`dist/tokens.css`](dist/tokens.css) | CSS-Variablen für Seiten ohne shadcn (erzeugt) |
| [`dist/tokens.json`](dist/tokens.json) | Alle Farben je Modus als `oklch()` und Hex, für alles andere (erzeugt) |
| [`dist/ohmtools-colors.sty`](dist/ohmtools-colors.sty) | Die Farben für LaTeX (erzeugt) |
| [`assets/app-icon.svg`](assets/app-icon.svg) | Vorlage für App-Icons |
| [`examples/index.html`](examples/index.html) | Das Erscheinungsbild nur mit `dist/tokens.css` nachgebaut |

## Verwendung

### shadcn-App (React, Tailwind v4)

1. Das Projekt nach shadcns [Vite-Anleitung](https://ui.shadcn.com/docs/installation/vite)
   aufsetzen, dann `components.json` und `src/index.css` durch
   [`shadcn/components.json`](shadcn/components.json) und
   [`shadcn/index.css`](shadcn/index.css) ersetzen. App-eigenes CSS kommt ans
   Ende von `src/index.css`.
2. Komponenten mit `npx shadcn@latest add <name>` hinzufügen und `uppercase`
   sowie `tracking-wider` / `tracking-widest` aus den erzeugten Dateien
   entfernen.
3. Dunkelmodus: `public/dark.js` und ein `ThemeProvider`, siehe DESIGN.md,
   „Light and dark“. Kein Umschalter für das Farbschema.
4. In der CI prüfen, dass das Theme unverändert bleibt:

   ```yaml
   - run: npx --yes github:ohmtools/design check src/index.css components.json src/components/ui/*.tsx
   ```

### Webseite ohne shadcn

[`dist/tokens.css`](dist/tokens.css) ins Projekt kopieren, nur die
CSS-Variablen verwenden (`var(--primary)`) und die Bedienelemente so nachbauen
wie [`examples/index.html`](examples/index.html). `ohmtools-design check`
prüft die Kopie und das eigene CSS der Seite ebenfalls.

### LaTeX

[`dist/ohmtools-colors.sty`](dist/ohmtools-colors.sty) neben die `.tex`-Datei
kopieren, `\usepackage{ohmtools-colors}`, dann die Namen verwenden: `ohm` plus
der Token in PascalCase (`primary` → `ohmPrimary`, `muted-foreground` →
`ohmMutedForeground`, `chart-1` → `ohmChart1`). Papier ist hell, deshalb sind
das die Werte des hellen Modus.

### Alles andere

[`dist/tokens.json`](dist/tokens.json) enthält jede Farbe je Modus als
`oklch()` und sRGB-Hex, dazu Schrift und Abstände und wofür jede Farbe da ist.

### Claude Code

In die `CLAUDE.md` des Projekts aufnehmen:

```md
## Design

Folgt dem ohmtools-Design: https://github.com/ohmtools/design, Regeln in dessen
DESIGN.md (shadcn base-sera, Red auf Neutral, Inter; keine Großbuchstaben,
keine Boxen, kein Umschalter für das Farbschema). Farben nur über dessen
Tokens. Vor jeder sichtbaren Änderung DESIGN.md lesen; eine Regel, die sich
ändern soll, wird zuerst dort geändert, für alle Apps.
```

## Die Prüfung

`npx --yes github:ohmtools/design check <datei>…`, im Wurzelverzeichnis des
Projekts aufgerufen, endet mit 1, wenn eine Datei dem Design nicht folgt:

- eine CSS-Datei, die `--primary` deklariert, muss alle Theme-Farben, den
  Radius und die Schrift unverändert enthalten, hell (`:root`) und dunkel
  (`.dark`, oder `:root` in einer Media-Query `prefers-color-scheme: dark`);
  app-eigene Variablen sind erlaubt;
- `components.json` muss denselben Stil, dieselbe Grundfarbe, dieselben Icons
  und dieselben Menü-Einstellungen verwenden;
- keine Datei darf Großbuchstaben oder gesperrte Schrift setzen
  (Tailwind-Klassen, `text-transform`, `\MakeUppercase`).

Für reproduzierbare CI einen Tag oder Commit festlegen
(`github:ohmtools/design#<ref>`).

## Das Design ändern

Eine Änderung hier ist eine Änderung für alle Apps. `tokens/` oder
`DESIGN.md` bearbeiten, dann:

```sh
npm run build   # shadcn/index.css, dist/ und die Tabelle in DESIGN.md neu erzeugen
npm test        # node:test
npm run check   # schlägt fehl, wenn eine erzeugte Datei veraltet ist (läuft in der CI)
```

Node 22 oder neuer, keine Abhängigkeiten. Die erzeugten Dateien mit der
Änderung committen; jede App übernimmt sie danach, und ihre Prüfung zeigt, was
noch fehlt.

## Lizenz

BSD-3-Clause, siehe [LICENSE](LICENSE).
