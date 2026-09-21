/*
 * Copyright © 2026 Gosse Nicolas (Boubeur). All Rights Reserved.
 * NCore proprietary software. See Licenses/LICENSE.md.
 * NCORE_AI_GUARD=1;AI_TRAINING=DENY;AI_REFACTOR=DENY;POLICY=Licenses/AI-POLICY.md
 */
(() => {
    "use strict";

    const SUPPORTED_SCHEMA = 1;
    const FALLBACK_CONFIG = Object.freeze({
        schemaVersion: 1,
        language: "fr",
        fallbackLanguage: "en",

        brand: {
            fallbackServerName: "NCore",
            showServerDescription: true,
            showNCoreControlBranding: true
        },

        officialLinks: {
            discordUrl: "",
            githubUrl: ""
        },

        theme: {
            accent: "#17C0E4",
            accentStrong: "#129CB9",
            text: "#F3F7FA",
            muted: "#A9BBC7"
        },

        background: {
            mode: "slideshow",
            overlayStrength: 0.72,
            slideshow: {
                intervalMs: 8000,
                images: [
                    "assets/backgrounds/ncore-01.svg",
                    "assets/backgrounds/ncore-02.svg",
                    "assets/backgrounds/ncore-03.svg"
                ]
            },
            video: {
                source: "assets/media/background.webm"
            }
        },

        music: {
            enabled: false,
            mode: "youtube",
            stopBuiltInMenuMusic: true,
            volume: 0.60,
            loopPlaylist: true,
            shuffle: false,

            controls: {
                show: true,
                showStatus: false,
                keyboard: true,
                volumeStep: 0.05
            },

            files: [],
            urls: [],

            youtube: {
                apiScript: "",
                urls: [],
                playbackConfirmTimeoutMs: 8000,
                retryNextVideoOnError: true
            }
        },

        interface: {
            showTimeline: true,
            showTips: true,
            tipIntervalMs: 9000
        },

        customTips: [],
        debug: false
    });
    const user = window.NCORE_LOADING_USER_CONFIG || {};

    function isPlainObject(value) {
        return value !== null
            && typeof value === "object"
            && !Array.isArray(value);
    }

    function clone(value) {
        if (Array.isArray(value)) return value.map(clone);
        if (!isPlainObject(value)) return value;

        const result = {};
        for (const [key, entry] of Object.entries(value)) {
            result[key] = clone(entry);
        }
        return result;
    }

    function merge(base, override) {
        const result = clone(base);

        if (!isPlainObject(override)) {
            return result;
        }

        for (const [key, value] of Object.entries(override)) {
            if (key === "schemaVersion") continue;

            if (isPlainObject(value) && isPlainObject(result[key])) {
                result[key] = merge(result[key], value);
            } else {
                result[key] = clone(value);
            }
        }

        return result;
    }

    function clampNumber(value, fallback, min, max) {
        const number = Number(value);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(max, Math.max(min, number));
    }

    function bool(value, fallback) {
        return typeof value === "boolean" ? value : fallback;
    }

    function string(value, fallback, maxLength = 256) {
        if (typeof value !== "string") return fallback;
        const normalized = value.trim();
        if (!normalized || normalized.length > maxLength) return fallback;
        return normalized;
    }

    function hexColor(value, fallback) {
        if (typeof value !== "string") return fallback;
        const normalized = value.trim();
        return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
    }

    function httpsUrl(value, fallback = "") {
        if (typeof value !== "string") return fallback;
        const normalized = value.trim();
        if (!normalized) return fallback;

        try {
            const url = new URL(normalized);
            return url.protocol === "https:" ? url.href : fallback;
        } catch (_) {
            return fallback;
        }
    }

    function language(value, fallback) {
        const candidate = string(value, fallback, 32).toLowerCase();
        return /^[a-z]{2}(?:-[a-z0-9]{2,8})?$/.test(candidate)
            ? candidate
            : fallback;
    }

    function enumValue(value, allowed, fallback) {
        return allowed.includes(value) ? value : fallback;
    }

    function stringArray(value, fallback, maxItems = 64, maxLength = 1024) {
        if (!Array.isArray(value)) return clone(fallback || []);

        const result = [];
        for (const entry of value.slice(0, maxItems)) {
            if (typeof entry !== "string") continue;
            const normalized = entry.trim();
            if (!normalized || normalized.length > maxLength) continue;
            result.push(normalized);
        }

        return result;
    }

    function normalize(candidate) {
        const normalized = merge(FALLBACK_CONFIG, candidate);

        normalized.schemaVersion = SUPPORTED_SCHEMA;
        normalized.language = language(normalized.language, "fr");
        normalized.fallbackLanguage = language(normalized.fallbackLanguage, "en");

        normalized.brand = normalized.brand || {};
        normalized.brand.fallbackServerName = string(normalized.brand.fallbackServerName, "NCore", 96);
        normalized.brand.showServerDescription = bool(normalized.brand.showServerDescription, true);
        normalized.brand.showNCoreControlBranding = bool(normalized.brand.showNCoreControlBranding, true);

        normalized.officialLinks = normalized.officialLinks || {};
        normalized.officialLinks.discordUrl = httpsUrl(normalized.officialLinks.discordUrl, "");
        normalized.officialLinks.githubUrl = httpsUrl(normalized.officialLinks.githubUrl, "");

        normalized.theme = normalized.theme || {};
        normalized.theme.accent = hexColor(normalized.theme.accent, "#17C0E4");
        normalized.theme.accentStrong = hexColor(normalized.theme.accentStrong, "#129CB9");
        normalized.theme.text = hexColor(normalized.theme.text, "#F3F7FA");
        normalized.theme.muted = hexColor(normalized.theme.muted, "#A9BBC7");

        normalized.background = normalized.background || {};
        normalized.background.mode = enumValue(
            normalized.background.mode,
            ["gradient", "slideshow", "video"],
            "slideshow"
        );
        normalized.background.overlayStrength = clampNumber(
            normalized.background.overlayStrength,
            0.72,
            0,
            1
        );
        normalized.background.slideshow = normalized.background.slideshow || {};
        normalized.background.slideshow.intervalMs = clampNumber(
            normalized.background.slideshow.intervalMs,
            8000,
            1000,
            120000
        );
        normalized.background.slideshow.images = stringArray(
            normalized.background.slideshow.images,
            FALLBACK_CONFIG.background?.slideshow?.images || [],
            64,
            512
        );
        normalized.background.video = normalized.background.video || {};
        normalized.background.video.source = string(
            normalized.background.video.source,
            FALLBACK_CONFIG.background?.video?.source || "assets/media/background.webm",
            512
        );

        normalized.music = normalized.music || {};
        normalized.music.enabled = bool(normalized.music.enabled, false);
        normalized.music.mode = enumValue(normalized.music.mode, ["youtube", "file", "url"], "youtube");
        normalized.music.stopBuiltInMenuMusic = bool(normalized.music.stopBuiltInMenuMusic, true);
        normalized.music.volume = clampNumber(normalized.music.volume, 0.60, 0, 1);
        normalized.music.loopPlaylist = bool(normalized.music.loopPlaylist, true);
        normalized.music.shuffle = bool(normalized.music.shuffle, false);
        normalized.music.files = stringArray(normalized.music.files, [], 64, 512);
        normalized.music.urls = stringArray(normalized.music.urls, [], 64, 2048);

        normalized.music.controls = normalized.music.controls || {};
        normalized.music.controls.show = bool(normalized.music.controls.show, true);
        normalized.music.controls.showStatus = bool(normalized.music.controls.showStatus, false);
        normalized.music.controls.keyboard = bool(normalized.music.controls.keyboard, true);
        normalized.music.controls.volumeStep = clampNumber(
            normalized.music.controls.volumeStep,
            0.05,
            0.01,
            0.25
        );

        normalized.music.youtube = normalized.music.youtube || {};
        normalized.music.youtube.apiScript = string(
            normalized.music.youtube.apiScript,
            FALLBACK_CONFIG.music?.youtube?.apiScript || "",
            2048
        );
        normalized.music.youtube.urls = stringArray(
            normalized.music.youtube.urls,
            FALLBACK_CONFIG.music?.youtube?.urls || [],
            64,
            2048
        );
        normalized.music.youtube.playbackConfirmTimeoutMs = clampNumber(
            normalized.music.youtube.playbackConfirmTimeoutMs,
            8000,
            1000,
            30000
        );
        normalized.music.youtube.retryNextVideoOnError = bool(
            normalized.music.youtube.retryNextVideoOnError,
            true
        );

        normalized.interface = normalized.interface || {};
        normalized.interface.showTimeline = bool(normalized.interface.showTimeline, true);
        normalized.interface.showTips = bool(normalized.interface.showTips, true);
        normalized.interface.tipIntervalMs = clampNumber(
            normalized.interface.tipIntervalMs,
            9000,
            2000,
            120000
        );

        normalized.customTips = stringArray(normalized.customTips, [], 64, 320);
        normalized.debug = bool(normalized.debug, false);

        return Object.freeze(normalized);
    }

    const fallbackSchema = Number(FALLBACK_CONFIG.schemaVersion);
    const userSchema = Number(user.schemaVersion);

    if (fallbackSchema !== SUPPORTED_SCHEMA) {
        throw new Error("[NCore Loading] Unsupported internal fallback schema");
    }

    if (userSchema !== SUPPORTED_SCHEMA) {
        console.warn(
            "[NCore Loading] User config schema is not supported; internal safe fallbacks are used."
        );
        window.NCORE_LOADING_CONFIG = normalize({});
        return;
    }

    window.NCORE_LOADING_CONFIG = normalize(user);
})();
