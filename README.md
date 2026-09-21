<p align="center">
  <img src="https://raw.githubusercontent.com/ncore-framework-official/.github/main/profile/assets/branding/ncore-loading-screen-official.webp" alt="NCore Loading Screen official visual identity" width="460">
</p>

<h1 align="center">NCore Loading Screen</h1>

<p align="center"><strong>Écran de chargement officiel NCore pour NANOS / nanos world.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Statut-WIP-F0A500?style=for-the-badge" alt="Work in progress">
  <img src="https://img.shields.io/badge/Version-0.5.1-6E7781?style=for-the-badge" alt="Version 0.5.1">
  <a href="https://discord.gg/Ey4dn4Cbqj">
    <img src="https://img.shields.io/badge/Discord-Officiel-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord officiel">
  </a>
  <a href="https://ko-fi.com/ncoreframework">
    <img src="https://img.shields.io/badge/Ko--fi-Soutenir_NCore-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white" alt="Soutenir NCore sur Ko-fi">
  </a>
</p>

> **Statut public : WIP.**  
> La version de travail actuelle est **0.5.1**. Le code présent dans ce dépôt correspond au miroir public-safe qualifié de `ncore-loading-screen`.  
> La publication Vault/Store NANOS reste en cours ; les GDD internes, outils de qualification, configuration de production et autres éléments privés restent hors du dépôt public.

## Français

### Présentation

`ncore-loading-screen` est un écran de chargement NANOS autonome. Il fonctionne sans `ncore-core`, sans base de données et sans dépendance gameplay.

### Fonctionnalités

- progression réelle fournie par NANOS via `UpdateScreen` ;
- timeline compacte des étapes de chargement ;
- interface française et anglaise avec fallback anglais ;
- trois fonds NCore locaux en slideshow ;
- fond vidéo WebM local optionnel ;
- audio local WebM/OGG optionnel ;
- URL audio HTTPS directe optionnelle ;
- lecture YouTube optionnelle en mode best-effort ;
- musique désactivée par défaut pour privilégier la stabilité NANOS/CEF ;
- identité visuelle officielle NCore ;
- aucun framework JavaScript lourd et aucun CDN obligatoire.

### Structure

```text
ncore-loading-screen/
├── Package.toml
├── index.html
├── Config/
│   └── config.js
├── Script/
│   ├── config-runtime.js
│   ├── app.js
│   └── style.css
├── Licenses/
│   ├── LICENSE.md
│   ├── COPYRIGHT.md
│   └── NOTICE.md
├── Languages/
│   ├── fr.js
│   └── en.js
└── assets/
```

`Package.toml` et `index.html` restent à la racine conformément au contrat NANOS du type `loading-screen`.

### Configuration

La configuration utilisateur se trouve uniquement dans `Config/config.js`. Le fichier est organisé en sections courtes et lisibles ; les réglages techniques restent internes à `Script/config-runtime.js`, qui construit et valide la configuration effective.

Le schéma de configuration courant est `schemaVersion = 1`.

Valeurs audio par défaut :

```text
music.enabled = false
music.mode    = "youtube"
music.volume  = 0.60
```

Lorsque la musique est activée, le bouton du mini-player gère pause/reprise. Les flèches haut/bas règlent le volume. Il n'existe pas de raccourci global Espace.


### Installation NANOS

Le loading screen NANOS nécessite un serveur dédié. Vérifiez que `dedicated_server = true`, puis placez le package dans `Packages/ncore-loading-screen` et configurez :

```toml
[game]
loading_screen = "ncore-loading-screen"
```

### Liens officiels

- Discord officiel : https://discord.gg/Ey4dn4Cbqj
- GitHub officiel : https://github.com/ncore-framework-official/ncore-loading-screen
- Ko-fi officiel : https://ko-fi.com/ncoreframework

Dans le loading screen, cliquer sur ces entrées copie l'URL dans le presse-papiers au lieu de naviguer dans le WebUI CEF.

### Licence

Voir `Licenses/LICENSE.md`, `Licenses/AI-POLICY.md`, `Licenses/COPYRIGHT.md` et `Licenses/NOTICE.md`.

NCore Loading Screen est un logiciel propriétaire NCore. Les droits d'utilisation d'une copie officielle sont définis par la licence incluse dans le package.

---

## English

### Overview

`ncore-loading-screen` is a standalone NANOS loading screen. It works without `ncore-core`, without a database, and without gameplay dependencies.

### Features

- real loading progress provided by NANOS through `UpdateScreen`;
- compact loading-stage timeline;
- French and English UI with English fallback;
- three local NCore slideshow backgrounds;
- optional local WebM video background;
- optional local WebM/OGG audio;
- optional direct HTTPS audio URL;
- optional best-effort YouTube playback;
- music disabled by default for NANOS/CEF stability;
- official NCore visual identity;
- no heavy JavaScript framework and no mandatory CDN.

### Layout

```text
ncore-loading-screen/
├── Package.toml
├── index.html
├── Config/
│   └── config.js
├── Script/
│   ├── config-runtime.js
│   ├── app.js
│   └── style.css
├── Licenses/
│   ├── LICENSE.md
│   ├── COPYRIGHT.md
│   └── NOTICE.md
├── Languages/
│   ├── fr.js
│   └── en.js
└── assets/
```

`Package.toml` and `index.html` stay at package root as required by the NANOS `loading-screen` contract.

### Configuration

User configuration is located only at `Config/config.js`. The file is organized into short, readable sections; technical settings remain internal to `Script/config-runtime.js`, which builds and validates the effective configuration.

The current configuration schema is `schemaVersion = 1`.

Default audio policy:

```text
music.enabled = false
music.mode    = "youtube"
music.volume  = 0.60
```

When music is enabled, the mini-player button controls pause/resume. Arrow Up/Down controls volume. There is no global Space shortcut.


### NANOS installation

NANOS loading screens require a dedicated server. Make sure `dedicated_server = true`, then place the package under `Packages/ncore-loading-screen` and configure:

```toml
[game]
loading_screen = "ncore-loading-screen"
```

### Official links

- Official Discord: https://discord.gg/Ey4dn4Cbqj
- Official GitHub: https://github.com/ncore-framework-official/ncore-loading-screen
- Official Ko-fi: https://ko-fi.com/ncoreframework

Inside the loading screen, clicking these entries copies the URL to the clipboard instead of navigating the CEF WebUI.

### License

See `Licenses/LICENSE.md`, `Licenses/AI-POLICY.md`, `Licenses/COPYRIGHT.md`, and `Licenses/NOTICE.md`.

NCore Loading Screen is proprietary NCore software. Rights for an official copy are defined by the license included with the package.


---

## Support public

- Discord officiel : https://discord.gg/Ey4dn4Cbqj
- Organisation NCore Framework : https://github.com/ncore-framework-official
- Ko-fi officiel : https://ko-fi.com/ncoreframework
- Support : [SUPPORT.md](SUPPORT.md)
