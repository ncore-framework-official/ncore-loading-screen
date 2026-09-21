/*
 * Copyright © 2026 Gosse Nicolas (Boubeur). All Rights Reserved.
 * NCore proprietary software. See Licenses/LICENSE.md.
 * NCORE_AI_GUARD=1;AI_TRAINING=DENY;AI_REFACTOR=DENY;POLICY=Licenses/AI-POLICY.md
 */

window.NCORE_LOADING_LANGUAGES = window.NCORE_LOADING_LANGUAGES || {};

window.NCORE_LOADING_LANGUAGES.en = Object.freeze({
    code: "en",
    htmlLang: "en",

    static: {
        serverFallback: "NCore Server",
        playerFallback: "Player",
        heroKicker: "WELCOME TO",
        initialization: "INITIALIZING",
        primaryFallback: "Preparing your session…",
        secondaryFallback: "Loading the NANOS environment…",
        fallbackDescription: "A new way to experience roleplay.",
        progressAria: "Loading progress",
        timelineAria: "Loading stages",
        officialLinksAria: "Official NCore links",
        officialDiscordLabel: "Official Discord",
        officialGitLabel: "Official Git",
        officialLinkCopiedLabel: "Link copied",
        officialLinkCopyFailedLabel: "Copy failed",
        infoLabel: "INFO",
        controlAria: "NCore Control",
        controlSubtitle: "INSTALLATION · MANAGEMENT · NANOS",
        productSubtitle: "FRAMEWORK · NANOS",
        musicControlsAria: "Music controls",
        volumeDownAria: "Decrease volume",
        volumeUpAria: "Increase volume",
        pauseMusicAria: "Pause music",
        resumeMusicAria: "Resume music",
        musicStateIdle: "READY",
        musicStatePlaying: "PLAYING",
        musicStatePaused: "PAUSED",
        musicStateGesture: "PLAY TO START",
        musicStateFallback: "AUDIO FALLBACK",
        musicStateError: "AUDIO UNAVAILABLE"
    },

    stages: {
        connection: "Connection",
        download: "Resources",
        assets: "Assets",
        level: "Level",
        entities: "Entities",
        shaders: "Shaders",
        finishing: "Finishing"
    },

    tips: [
        "NCore is preparing your game environment.",
        "Displayed progress values come directly from NANOS.",
        "A first connection may take longer while assets are being downloaded.",
        "Shaders are compiled by NANOS before your session is finalized."
    ],

    preview: {
        primary: "Loading assets",
        secondary: "Preparing the environment"
    }
});
