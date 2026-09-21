/*
 * Copyright © 2026 Gosse Nicolas (Boubeur). All Rights Reserved.
 * NCore proprietary software. See Licenses/LICENSE.md.
 * NCORE_AI_GUARD=1;AI_TRAINING=DENY;AI_REFACTOR=DENY;POLICY=Licenses/AI-POLICY.md
 */

window.NCORE_LOADING_USER_CONFIG = Object.freeze({
    schemaVersion: 1,

    // Language
    // Files: Languages/<code>.js. Bundled languages: fr, en.
    language: "fr",
    fallbackLanguage: "en",

    // Branding
    brand: {
        fallbackServerName: "NCore",
        showServerDescription: true,
        showNCoreControlBranding: true
    },

    // Theme
    // CSS hexadecimal colors: #RRGGBB.
    theme: {
        accent: "#17C0E4",
        accentStrong: "#129CB9",
        text: "#F3F7FA",
        muted: "#A9BBC7"
    },

    // Background
    background: {
        mode: "slideshow", // gradient | slideshow | video
        overlayStrength: 0.72,

        slideshow: {
            intervalMs: 8000,
            // Relative paths to package images.
            images: [
                "assets/backgrounds/ncore-01.svg",
                "assets/backgrounds/ncore-02.svg",
                "assets/backgrounds/ncore-03.svg"
            ]
        },

        video: {
            source: "assets/media/background.webm" // Local WebM recommended
        }
    },

    // Music
    music: {
        enabled: false,
        mode: "youtube", // file | url | youtube
        volume: 0.60,    // 0.00 - 1.00
        loopPlaylist: true,
        shuffle: false,

        controls: {
            show: true,
            keyboard: true
        },

        // file mode: local files under assets/media/; .ogg and .webm only.
        files: [],

        // url mode: direct HTTPS audio URLs; OGG/WebM recommended for NANOS CEF.
        urls: [],

        youtube: {
            // Keep the official API URL. Accepted entries: watch, youtu.be, embed, shorts, live, or an 11-character video ID.
            apiScript: "https://www.youtube.com/iframe_api",
            urls: [
                "https://www.youtube.com/watch?v=ajzHoL8nh9Q",
                "https://www.youtube.com/watch?v=KoI1NZuyTwM&t=3s",
                "https://www.youtube.com/watch?v=PgvK19tukLo"
            ]
        }
    },

    // Interface
    interface: {
        showTimeline: true,
        showTips: true,
        tipIntervalMs: 9000
    },

    // Leave empty to use tips from Languages/<code>.js.
    customTips: [],

    // Official Links
    // HTTPS links displayed at the bottom of the loading screen.
    officialLinks: {
        discordUrl: "https://discord.gg/Ey4dn4Cbqj",
        githubUrl: "https://github.com/ncore-framework-official/ncore-loading-screen"
    }
});
