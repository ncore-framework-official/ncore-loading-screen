/*
 * Copyright © 2026 Gosse Nicolas (Boubeur). All Rights Reserved.
 * NCore proprietary software. See Licenses/LICENSE.md.
 * NCORE_AI_GUARD=1;AI_TRAINING=DENY;AI_REFACTOR=DENY;POLICY=Licenses/AI-POLICY.md
 */

(() => {
    "use strict";

    const config = window.NCORE_LOADING_CONFIG || {};

    const INTERNAL_FALLBACK = Object.freeze({
        code: "en",
        htmlLang: "en",
        static: Object.freeze({
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
            musicStateIdle: "READY",
            musicStatePlaying: "PLAYING",
            musicStatePaused: "PAUSED",
            musicStateGesture: "PLAY TO START",
            musicStateFallback: "AUDIO FALLBACK",
            musicStateError: "AUDIO UNAVAILABLE"
        }),
        stages: Object.freeze({
            connection: "Connection",
            download: "Resources",
            assets: "Assets",
            level: "Level",
            entities: "Entities",
            shaders: "Shaders",
            finishing: "Finishing"
        }),
        tips: Object.freeze([
            "NCore is preparing your game environment."
        ]),
        preview: Object.freeze({
            primary: "Loading assets",
            secondary: "Preparing the environment"
        })
    });

    const Stage = Object.freeze({
        None: 0,
        Connecting: 1,
        Fetching: 2,
        Validating: 3,
        Downloading: 4,
        LoadingAssets: 5,
        LoadingLevel: 6,
        LoadingEntities: 7,
        CompilingShaders: 8,
        Finishing: 9
    });

    const stageDefinitions = Object.freeze([
        { key: "connection", start: Stage.Connecting, end: Stage.Validating },
        { key: "download", start: Stage.Downloading, end: Stage.Downloading },
        { key: "assets", start: Stage.LoadingAssets, end: Stage.LoadingAssets },
        { key: "level", start: Stage.LoadingLevel, end: Stage.LoadingLevel },
        { key: "entities", start: Stage.LoadingEntities, end: Stage.LoadingEntities },
        { key: "shaders", start: Stage.CompilingShaders, end: Stage.CompilingShaders },
        { key: "finishing", start: Stage.Finishing, end: Stage.Finishing }
    ]);

    const els = {
        brandSubtitle: document.getElementById("brandSubtitle"),
        serverName: document.getElementById("serverName"),
        serverDescription: document.getElementById("serverDescription"),
        heroKicker: document.getElementById("heroKicker"),
        stageName: document.getElementById("stageName"),
        primaryMessage: document.getElementById("primaryMessage"),
        secondaryMessage: document.getElementById("secondaryMessage"),
        overallPercent: document.getElementById("overallPercent"),
        overallTrack: document.getElementById("overallTrack"),
        overallBar: document.getElementById("overallBar"),
        subprogressPercent: document.getElementById("subprogressPercent"),
        stageTimeline: document.getElementById("stageTimeline"),
        tipLabel: document.getElementById("tipLabel"),
        tipText: document.getElementById("tipText"),
        backgroundA: document.getElementById("backgroundA"),
        backgroundB: document.getElementById("backgroundB"),
        backgroundVideo: document.getElementById("backgroundVideo"),
        loadingMusic: document.getElementById("loadingMusic"),
        youtubeMusic: document.getElementById("youtubeMusic"),
        audioControls: document.getElementById("audioControls"),
        volumeDown: document.getElementById("volumeDown"),
        volumeUp: document.getElementById("volumeUp"),
        volumeValue: document.getElementById("volumeValue"),
        audioState: document.getElementById("audioState"),
        musicToggle: document.getElementById("musicToggle"),
        ncoreControlBrand: document.getElementById("ncoreControlBrand"),
        ncoreControlSubtitle: document.getElementById("ncoreControlSubtitle"),
        officialLinks: document.getElementById("officialLinks"),
        officialDiscordLink: document.getElementById("officialDiscordLink"),
        officialGitLink: document.getElementById("officialGitLink")
    };

    const stageItems = new Map(
        Array.from(document.querySelectorAll("[data-stage-key]"))
            .map((element) => [element.dataset.stageKey, element])
    );

    const state = {
        currentStage: Stage.None,
        backgroundIndex: 0,
        activeBackgroundLayer: "A",
        tipIndex: 0,
        musicIndex: 0,
        musicVolume: 0.60,
        musicPaused: false,
        musicStarted: false,
        musicAwaitingGesture: false,
        musicStatus: "idle",
        musicStatusDetail: "",
        activeMusicMode: "",
        youtubePlaybackConfirmed: false,
        youtubeIndex: 0,
        youtubeErrorCount: 0,
        youtubeFallbackTimer: null,
        menuMusicStopTimer: null,
        menuMusicStopAttempts: 0,
        builtInMenuMusicStopped: false,
        audioTeardownPrepared: false,
        localAudioObjectUrl: "",
        audioPlaylistLocalFiles: false,
        youtubeApiPromise: null,
        youtubePlayer: null,
        pendingLoadingUpdate: null,
        loadingFrameScheduled: false,
        officialLinkFeedbackTimer: null,
        language: INTERNAL_FALLBACK
    };

    function clamp01(value) {
        if (!Number.isFinite(value)) return 0;
        return Math.max(0, Math.min(1, value));
    }

    function ratio(current, total) {
        const currentNumber = Number(current);
        const totalNumber = Number(total);
        if (!Number.isFinite(currentNumber) || !Number.isFinite(totalNumber) || totalNumber <= 0) return null;
        return clamp01(currentNumber / totalNumber);
    }

    function percentage(value) {
        return Math.round(clamp01(value) * 100);
    }

    function normalizeLanguageCode(value, fallback) {
        const raw = String(value || "").trim().toLowerCase();
        if (/^[a-z]{2}(?:-[a-z0-9]{2,8})?$/.test(raw)) return raw;
        return fallback;
    }

    function getLanguageRegistry() {
        window.NCORE_LOADING_LANGUAGES = window.NCORE_LOADING_LANGUAGES || {};
        return window.NCORE_LOADING_LANGUAGES;
    }

    function loadLanguageScript(code) {
        const registry = getLanguageRegistry();
        if (registry[code]) return Promise.resolve(registry[code]);

        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `Languages/${encodeURIComponent(code)}.js`;
            script.async = true;

            script.onload = () => {
                const loaded = getLanguageRegistry()[code];
                if (loaded) {
                    resolve(loaded);
                    return;
                }

                reject(new Error(`Language pack did not register: ${code}`));
            };

            script.onerror = () => reject(new Error(`Unable to load language pack: ${code}`));
            document.head.appendChild(script);
        });
    }

    async function resolveLanguage() {
        const fallbackCode = normalizeLanguageCode(config.fallbackLanguage, "en");
        const requestedCode = normalizeLanguageCode(config.language, fallbackCode);

        try {
            return await loadLanguageScript(requestedCode);
        } catch (requestedError) {
            if (config.debug) {
                console.warn("[NCore Loading] Requested language unavailable", requestedCode, requestedError);
            }
        }

        if (fallbackCode !== requestedCode) {
            try {
                return await loadLanguageScript(fallbackCode);
            } catch (fallbackError) {
                if (config.debug) {
                    console.warn("[NCore Loading] Fallback language unavailable", fallbackCode, fallbackError);
                }
            }
        }

        return INTERNAL_FALLBACK;
    }

    function getNested(source, path) {
        let cursor = source;

        for (const key of path.split(".")) {
            if (!cursor || typeof cursor !== "object" || !(key in cursor)) return undefined;
            cursor = cursor[key];
        }

        return cursor;
    }

    function text(path, fallback = "") {
        const value = getNested(state.language, path);
        return typeof value === "string" && value.length > 0 ? value : fallback;
    }

    function getConfiguredMusicVolume() {
        const value = Number(config.music?.volume);
        return Number.isFinite(value) ? clamp01(value) : 0.60;
    }

    function getMusicVolumeStep() {
        const value = Number(config.music?.controls?.volumeStep);
        return Number.isFinite(value) && value > 0 ? Math.min(0.25, value) : 0.05;
    }

    function setAudioStatus(status, detail = "", level = "info") {
        const normalizedStatus = String(status || "idle");
        const normalizedDetail = String(detail || "");
        const changed = state.musicStatus !== normalizedStatus
            || state.musicStatusDetail !== normalizedDetail;

        state.musicStatus = normalizedStatus;
        state.musicStatusDetail = normalizedDetail;

        const labels = {
            idle: text("static.musicStateIdle", "READY"),
            playing: text("static.musicStatePlaying", "PLAYING"),
            paused: text("static.musicStatePaused", "PAUSED"),
            gesture: text("static.musicStateGesture", "PLAY TO START"),
            fallback: text("static.musicStateFallback", "AUDIO FALLBACK"),
            error: text("static.musicStateError", "AUDIO UNAVAILABLE")
        };

        if (els.audioState) {
            const showStatus = config.music?.controls?.showStatus !== false;
            els.audioState.hidden = !showStatus;
            els.audioState.textContent = labels[normalizedStatus] || normalizedStatus.toUpperCase();
            els.audioState.dataset.level = level;
            els.audioState.title = normalizedDetail;
        }

        window.NCORE_LOADING_DIAGNOSTICS = Object.freeze({
            audio: Object.freeze({
                status: normalizedStatus,
                detail: normalizedDetail,
                mode: state.activeMusicMode,
                started: state.musicStarted,
                paused: state.musicPaused,
                awaitingGesture: state.musicAwaitingGesture,
                volume: state.musicVolume
            })
        });

        if (changed) {
            const logger = level === "error" ? console.error
                : level === "warning" ? console.warn
                : console.info;
            logger("[NCore Loading][Audio]", normalizedStatus, normalizedDetail);
        }
    }

    function markMusicStarted(mode) {
        state.activeMusicMode = mode;
        state.musicStarted = true;
        state.musicAwaitingGesture = false;
        state.musicPaused = false;
        setAudioStatus("playing", mode);
        updateMusicControls();
    }

    function requestMusicGesture(reason) {
        state.musicAwaitingGesture = true;
        state.musicPaused = false;
        setAudioStatus("gesture", reason, "warning");
        updateMusicControls();
    }

    function resumeMusicFromGesture() {
        state.musicPaused = false;

        if (state.activeMusicMode === "audio") {
            const result = els.loadingMusic?.play?.();
            result?.catch?.(() => requestMusicGesture("html-audio-autoplay-blocked"));
            return;
        }

        if (state.activeMusicMode === "youtube") {
            try {
                state.youtubePlayer?.playVideo?.();
            } catch (_) {
                requestMusicGesture("youtube-playback-not-ready");
            }
            return;
        }

        void configureMusic();
    }

    function updateMusicControls() {
        if (els.volumeValue) {
            els.volumeValue.textContent = `${Math.round(state.musicVolume * 100)}%`;
        }

        if (els.musicToggle) {
            const shouldResume = state.musicPaused
                || (!state.musicStarted && state.musicAwaitingGesture);
            const label = shouldResume
                ? text("static.resumeMusicAria", "Resume music")
                : text("static.pauseMusicAria", "Pause music");
            els.musicToggle.textContent = shouldResume ? "▶" : "Ⅱ";
            els.musicToggle.setAttribute("aria-label", label);
            els.musicToggle.title = label;
        }

        if (els.volumeDown) {
            const label = text("static.volumeDownAria", "Decrease volume");
            els.volumeDown.setAttribute("aria-label", label);
            els.volumeDown.title = label;
        }

        if (els.volumeUp) {
            const label = text("static.volumeUpAria", "Increase volume");
            els.volumeUp.setAttribute("aria-label", label);
            els.volumeUp.title = label;
        }

        if (els.audioControls) {
            els.audioControls.setAttribute("aria-label", text("static.musicControlsAria", "Music controls"));
        }

    }

    function setMusicVolume(value) {
        state.musicVolume = clamp01(value);

        if (els.loadingMusic) {
            els.loadingMusic.volume = state.musicVolume;
        }

        try {
            state.youtubePlayer?.setVolume?.(Math.round(state.musicVolume * 100));
        } catch (_) {}

        updateMusicControls();
    }

    function setMusicPaused(paused) {
        if (config.music?.enabled === false) return;

        state.musicPaused = Boolean(paused);

        if (state.musicPaused) {
            els.loadingMusic?.pause?.();
            try { state.youtubePlayer?.pauseVideo?.(); } catch (_) {}
            setAudioStatus("paused", state.activeMusicMode);
        } else {
            resumeMusicFromGesture();
        }

        updateMusicControls();
    }

    function toggleMusicPause() {
        if (!state.musicStarted && state.musicAwaitingGesture) {
            resumeMusicFromGesture();
            updateMusicControls();
            return;
        }

        setMusicPaused(!state.musicPaused);
    }

    function bindMusicControls() {
        state.musicVolume = getConfiguredMusicVolume();

        if (config.music?.enabled === false || config.music?.controls?.show === false) {
            if (els.audioControls) els.audioControls.hidden = true;
            return;
        }

        els.volumeDown?.addEventListener("click", () => {
            setMusicVolume(state.musicVolume - getMusicVolumeStep());
        });

        els.volumeUp?.addEventListener("click", () => {
            setMusicVolume(state.musicVolume + getMusicVolumeStep());
        });

        els.musicToggle?.addEventListener("click", () => {
            toggleMusicPause();
        });

        document.addEventListener("keydown", (event) => {
            if (config.music?.controls?.keyboard === false || event.repeat) return;

            const tag = String(event.target?.tagName || "").toLowerCase();
            if (["input", "textarea", "select", "button"].includes(tag)) return;

            if (event.code === "ArrowDown") {
                event.preventDefault();
                setMusicVolume(state.musicVolume - getMusicVolumeStep());
                return;
            }

            if (event.code === "ArrowUp") {
                event.preventDefault();
                setMusicVolume(state.musicVolume + getMusicVolumeStep());
            }
        });

        setMusicVolume(state.musicVolume);
    }

    function setProgress(value) {
        const indeterminate = value === null;
        els.overallTrack.classList.toggle("is-indeterminate", indeterminate);

        if (!indeterminate) {
            els.overallBar.style.transform = `scaleX(${clamp01(value)})`;
        }
    }

    function getCurrentDefinition(stage) {
        return stageDefinitions.find((definition) => stage >= definition.start && stage <= definition.end) || null;
    }

    function getStageLabel(stage) {
        const definition = getCurrentDefinition(stage);
        if (!definition) return text("static.initialization", "INITIALIZING").toUpperCase();

        const label = state.language?.stages?.[definition.key] || definition.key;
        return String(label).toUpperCase();
    }

    function applyStaticLanguage() {
        document.documentElement.lang = String(state.language.htmlLang || state.language.code || "en");

        if (els.brandSubtitle) {
            els.brandSubtitle.textContent = text("static.productSubtitle", "FRAMEWORK · NANOS");
        }

        if (els.heroKicker) {
            els.heroKicker.textContent = text("static.heroKicker", "WELCOME TO");
        }

        if (els.serverDescription) {
            els.serverDescription.textContent = text("static.fallbackDescription", "");
        }

        if (els.stageName) {
            els.stageName.textContent = text("static.initialization", "INITIALIZING");
        }

        if (els.primaryMessage) {
            els.primaryMessage.textContent = text("static.primaryFallback", "Preparing your session…");
        }

        if (els.secondaryMessage) {
            els.secondaryMessage.textContent = text("static.secondaryFallback", "Loading the NANOS environment…");
        }

        if (els.overallTrack) {
            els.overallTrack.setAttribute("aria-label", text("static.progressAria", "Loading progress"));
        }

        if (els.stageTimeline) {
            els.stageTimeline.setAttribute("aria-label", text("static.timelineAria", "Loading stages"));
        }

        if (els.officialLinks) {
            els.officialLinks.setAttribute("aria-label", text("static.officialLinksAria", "Official NCore links"));
        }

        if (els.officialDiscordLink) {
            els.officialDiscordLink.textContent = text("static.officialDiscordLabel", "Official Discord");
        }

        if (els.officialGitLink) {
            els.officialGitLink.textContent = text("static.officialGitLabel", "Official Git");
        }

        if (els.tipLabel) {
            els.tipLabel.textContent = text("static.infoLabel", "INFO");
        }

        if (els.ncoreControlBrand) {
            els.ncoreControlBrand.setAttribute("aria-label", text("static.controlAria", "NCore Control"));
        }

        if (els.ncoreControlSubtitle) {
            els.ncoreControlSubtitle.textContent = text("static.controlSubtitle", "INSTALLATION · MANAGEMENT · NANOS");
        }

        stageDefinitions.forEach((definition) => {
            const item = stageItems.get(definition.key);
            const label = item?.querySelector("span");
            const translated = state.language?.stages?.[definition.key];

            if (label && typeof translated === "string" && translated.length > 0) {
                label.textContent = translated;
            }
        });
    }

    function updateTimeline(stage, activeRatio) {
        stageDefinitions.forEach((definition) => {
            const item = stageItems.get(definition.key);
            if (!item) return;

            item.classList.remove("is-active", "is-done");

            if (stage > definition.end) {
                item.classList.add("is-done");
                item.removeAttribute("data-progress");
                return;
            }

            if (stage >= definition.start && stage <= definition.end) {
                item.classList.add("is-active");

                if (activeRatio !== null) {
                    item.dataset.progress = `${percentage(activeRatio)}%`;
                } else {
                    item.removeAttribute("data-progress");
                }

                return;
            }

            item.removeAttribute("data-progress");
        });
    }

    function updateLoadingScreen(
        message,
        messageSecondary,
        progressSmall,
        progressSmallTotal,
        progress,
        progressTotal,
        currentStage
    ) {
        const parsedStage = Number(currentStage);
        const stage = Number.isFinite(parsedStage) ? parsedStage : Stage.None;
        const mainRatio = ratio(progress, progressTotal);
        const smallRatio = ratio(progressSmall, progressSmallTotal);

        state.currentStage = stage;

        if (stage >= Stage.Finishing) {
            prepareAudioForUnload();
        }

        els.stageName.textContent = getStageLabel(stage);
        els.primaryMessage.textContent = message || text("static.primaryFallback", "Preparing your session…");
        els.secondaryMessage.textContent = messageSecondary || text("static.secondaryFallback", "Loading the NANOS environment…");
        els.overallPercent.textContent = mainRatio === null ? "—" : `${percentage(mainRatio)}%`;
        els.subprogressPercent.textContent = smallRatio === null ? "" : `${percentage(smallRatio)}%`;

        setProgress(mainRatio);
        updateTimeline(stage, mainRatio);

        document.body.dataset.stage = String(stage);

        if (config.debug) {
            console.debug("[NCore Loading] UpdateScreen", {
                message,
                messageSecondary,
                progressSmall,
                progressSmallTotal,
                progress,
                progressTotal,
                currentStage: stage
            });
        }
    }

    function queueLoadingScreenUpdate(...args) {
        state.pendingLoadingUpdate = args;
        if (state.loadingFrameScheduled) return;

        state.loadingFrameScheduled = true;

        window.requestAnimationFrame(() => {
            state.loadingFrameScheduled = false;
            const pending = state.pendingLoadingUpdate;
            state.pendingLoadingUpdate = null;
            if (pending) updateLoadingScreen(...pending);
        });
    }

    function applyLoadingScreenInfo() {
        const info = window.LoadingScreen;
        if (!info?.server) return false;

        const fallbackName = config.brand?.fallbackServerName || "NCore";
        const fallbackDescription = text("static.fallbackDescription", "");
        const serverName = info.server.name || fallbackName;

        els.serverName.textContent = serverName;
        els.serverDescription.textContent = info.server.description || fallbackDescription;

        if (config.brand?.showServerDescription === false) {
            els.serverDescription.hidden = true;
        }

        return true;
    }

    function waitForLoadingScreenInfo() {
        if (applyLoadingScreenInfo()) return;

        let attempts = 0;
        const maxAttempts = 40;
        const retryDelayMs = 250;

        function retry() {
            attempts += 1;
            if (applyLoadingScreenInfo() || attempts >= maxAttempts) return;
            window.setTimeout(retry, retryDelayMs);
        }

        window.setTimeout(retry, retryDelayMs);
    }

    function applyTheme() {
        const theme = config.theme || {};
        if (theme.accent) document.documentElement.style.setProperty("--accent", theme.accent);
        if (theme.accentStrong) document.documentElement.style.setProperty("--accent-strong", theme.accentStrong);
        if (theme.text) document.documentElement.style.setProperty("--text", theme.text);
        if (theme.muted) document.documentElement.style.setProperty("--muted", theme.muted);

        const overlayStrength = Number(config.background?.overlayStrength);

        if (Number.isFinite(overlayStrength)) {
            document.documentElement.style.setProperty("--overlay-strength", String(clamp01(overlayStrength)));
        }
    }

    function normalizeLocalPackageAssetPath(value, category, allowedExtensions) {
        const raw = String(value || "").trim().replace(/\\/g, "/");
        if (!raw
            || raw.startsWith("/")
            || raw.startsWith("//")
            || raw.includes("://")
            || raw.includes("?")
            || raw.includes("#")) {
            return "";
        }

        const parts = raw.split("/");
        if (parts.length < 3
            || parts[0] !== "assets"
            || parts[1] !== category
            || parts.some((part) => !part || part === "." || part === "..")) {
            return "";
        }

        const lower = raw.toLowerCase();
        return allowedExtensions.some((extension) => lower.endsWith(extension)) ? raw : "";
    }

    function normalizeBackgroundImagePath(value) {
        return normalizeLocalPackageAssetPath(
            value,
            "backgrounds",
            [".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif"]
        );
    }

    function normalizeBackgroundVideoPath(value) {
        return normalizeLocalPackageAssetPath(value, "media", [".webm"]);
    }

    function setBackgroundImage(layer, source) {
        const safeSource = normalizeBackgroundImagePath(source);
        layer.style.backgroundImage = safeSource ? `url("${safeSource}")` : "none";
    }

    function startSlideshow(images, intervalMs) {
        const sources = Array.isArray(images)
            ? images.map(normalizeBackgroundImagePath).filter(Boolean)
            : [];
        if (sources.length === 0) return;

        setBackgroundImage(els.backgroundA, sources[0]);
        els.backgroundA.classList.add("is-visible");
        document.body.classList.add("has-media-background");

        if (sources.length === 1) return;

        window.setInterval(() => {
            state.backgroundIndex = (state.backgroundIndex + 1) % sources.length;

            const nextLayer = state.activeBackgroundLayer === "A"
                ? els.backgroundB
                : els.backgroundA;

            const currentLayer = state.activeBackgroundLayer === "A"
                ? els.backgroundA
                : els.backgroundB;

            setBackgroundImage(nextLayer, sources[state.backgroundIndex]);
            nextLayer.classList.add("is-visible");
            currentLayer.classList.remove("is-visible");
            state.activeBackgroundLayer = state.activeBackgroundLayer === "A" ? "B" : "A";
        }, Math.max(3000, Number(intervalMs) || 7000));
    }

    function configureBackground() {
        const background = config.background || {};
        const mode = background.mode || "gradient";

        if (mode === "slideshow") {
            startSlideshow(background.slideshow?.images, background.slideshow?.intervalMs);
            return;
        }

        const videoSource = normalizeBackgroundVideoPath(background.video?.source);

        if (mode === "video" && videoSource) {
            els.backgroundVideo.src = videoSource;
            els.backgroundVideo.classList.add("is-visible");
            document.body.classList.add("has-media-background");
            els.backgroundVideo.play()?.catch?.(() => {});
        }
    }

    function resolveTips() {
        const custom = Array.isArray(config.customTips)
            ? config.customTips.filter((value) => typeof value === "string" && value.trim().length > 0)
            : [];

        if (custom.length > 0) return custom;

        return Array.isArray(state.language.tips)
            ? state.language.tips.filter((value) => typeof value === "string" && value.length > 0)
            : [];
    }

    function rotateTips() {
        if (config.interface?.showTips === false) {
            document.querySelector(".tip-line")?.setAttribute("hidden", "");
            return;
        }

        const tips = resolveTips();
        if (tips.length === 0) return;

        els.tipText.textContent = tips[0];

        if (tips.length === 1) return;

        window.setInterval(() => {
            state.tipIndex = (state.tipIndex + 1) % tips.length;
            els.tipText.classList.add("is-changing");

            window.setTimeout(() => {
                els.tipText.textContent = tips[state.tipIndex];
                els.tipText.classList.remove("is-changing");
            }, 160);
        }, Math.max(3500, Number(config.interface?.tipIntervalMs) || 9000));
    }

    function stopBuiltInMenuMusic() {
        if (config.music?.stopBuiltInMenuMusic === false
            || state.builtInMenuMusicStopped) return true;

        if (window.Events && typeof window.Events.Call === "function") {
            try {
                window.Events.Call("StopMenuMusic");
                state.builtInMenuMusicStopped = true;

                if (state.menuMusicStopTimer) {
                    window.clearTimeout(state.menuMusicStopTimer);
                    state.menuMusicStopTimer = null;
                }

                return true;
            } catch (error) {
                if (config.debug) console.warn("[NCore Loading] StopMenuMusic failed", error);
            }
        }

        if (state.menuMusicStopAttempts >= 20) return false;

        state.menuMusicStopAttempts += 1;

        if (!state.menuMusicStopTimer) {
            state.menuMusicStopTimer = window.setTimeout(() => {
                state.menuMusicStopTimer = null;
                stopBuiltInMenuMusic();
            }, 100);
        }

        return false;
    }

    function revokeLocalAudioObjectUrl() {
        if (!state.localAudioObjectUrl) return;

        try {
            URL.revokeObjectURL(state.localAudioObjectUrl);
        } catch (_) {}

        state.localAudioObjectUrl = "";
    }

    function normalizeLocalAudioPath(value) {
        const raw = String(value || "").trim().replace(/\\/g, "/");
        if (!raw
            || raw.startsWith("/")
            || raw.startsWith("//")
            || raw.includes("://")
            || raw.includes("?")
            || raw.includes("#")) {
            return "";
        }

        const parts = raw.split("/");
        if (parts.length < 3
            || parts[0] !== "assets"
            || parts[1] !== "media"
            || parts.some((part) => !part || part === "." || part === "..")) {
            return "";
        }

        const lower = raw.toLowerCase();
        if (!lower.endsWith(".ogg") && !lower.endsWith(".webm")) {
            return "";
        }

        return raw;
    }

    function getLocalAudioMime(path) {
        const lower = String(path || "").toLowerCase();
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".webm")) return "audio/webm";
        return "";
    }

    function normalizeDirectAudioUrl(value) {
        const raw = String(value || "").trim();
        if (!raw) return "";

        try {
            const url = new URL(raw);
            return url.protocol === "https:" ? url.href : "";
        } catch (_) {
            return "";
        }
    }

    async function resolveLocalAudioSource(value) {
        const path = normalizeLocalAudioPath(value);
        const mime = getLocalAudioMime(path);

        if (!path || !mime) {
            setAudioStatus("error", "local-audio-path-invalid", "error");
            return "";
        }

        try {
            const response = await fetch(path, {
                cache: "no-store",
                credentials: "same-origin"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const bytes = await response.arrayBuffer();
            if (bytes.byteLength === 0) {
                throw new Error("empty-local-audio");
            }

            return URL.createObjectURL(new Blob([bytes], { type: mime }));
        } catch (error) {
            setAudioStatus("error", "local-audio-fetch-error", "error");
            if (config.debug) {
                console.warn("[NCore Loading] Local audio fetch failed", error);
            }
            return "";
        }
    }

    async function playConfiguredTrack(tracks, music, localFiles = false) {
        if (!els.loadingMusic || tracks.length === 0) return false;

        const configuredSource = tracks[state.musicIndex % tracks.length];
        let playbackSource = configuredSource;

        if (localFiles) {
            const objectUrl = await resolveLocalAudioSource(configuredSource);
            if (!objectUrl) return false;

            revokeLocalAudioObjectUrl();
            state.localAudioObjectUrl = objectUrl;
            playbackSource = objectUrl;
        } else {
            revokeLocalAudioObjectUrl();
        }

        els.loadingMusic.src = playbackSource;
        els.loadingMusic.volume = state.musicVolume;
        els.loadingMusic.loop = tracks.length === 1 && music.loopPlaylist !== false;

        try {
            const result = els.loadingMusic.play?.();
            result?.catch?.((error) => {
                requestMusicGesture("html-audio-autoplay-blocked");
                if (config.debug) console.warn("[NCore Loading] Music autoplay delayed", error);
            });
        } catch (error) {
            requestMusicGesture("html-audio-autoplay-blocked");
            if (config.debug) console.warn("[NCore Loading] Music autoplay delayed", error);
        }

        return true;
    }

    function startAudioPlaylist(tracks, music, localFiles = false) {
        const sources = Array.isArray(tracks)
            ? tracks
                .map((value) => localFiles
                    ? normalizeLocalAudioPath(value)
                    : normalizeDirectAudioUrl(value))
                .filter(Boolean)
            : [];
        if (!els.loadingMusic || sources.length === 0) return false;

        function buildPlaylistOrder() {
            const order = sources.map((_, index) => index);
            if (music.shuffle !== true || order.length < 2) return order;

            for (let index = order.length - 1; index > 0; index -= 1) {
                const target = Math.floor(Math.random() * (index + 1));
                [order[index], order[target]] = [order[target], order[index]];
            }

            return order;
        }

        let order = buildPlaylistOrder();
        let position = 0;
        let consecutiveFailures = 0;

        state.musicIndex = order[position];
        state.audioPlaylistLocalFiles = Boolean(localFiles);
        state.activeMusicMode = "audio";

        function advanceSource(allowLoop) {
            position += 1;

            if (position >= order.length) {
                if (!allowLoop) return false;
                order = buildPlaylistOrder();
                position = 0;
            }

            state.musicIndex = order[position];
            return true;
        }

        async function playCurrentSource() {
            const started = await playConfiguredTrack(
                sources,
                music,
                state.audioPlaylistLocalFiles
            );

            if (started) return true;

            consecutiveFailures += 1;
            if (consecutiveFailures >= sources.length
                || !advanceSource(music.loopPlaylist !== false)) {

                setAudioStatus("error", "audio-sources-exhausted", "error");
                return false;
            }

            return playCurrentSource();
        }

        els.loadingMusic.addEventListener("playing", () => {
            consecutiveFailures = 0;
            markMusicStarted("audio");
            stopBuiltInMenuMusic();
        });

        els.loadingMusic.addEventListener("ended", () => {
            if (sources.length === 1) return;
            if (!advanceSource(music.loopPlaylist !== false)) return;

            consecutiveFailures = 0;
            void playCurrentSource();
        });

        els.loadingMusic.addEventListener("error", () => {
            setAudioStatus("error", "html-audio-source-error", "error");
            consecutiveFailures += 1;

            if (consecutiveFailures >= sources.length
                || !advanceSource(music.loopPlaylist !== false)) {

                setAudioStatus("error", "audio-sources-exhausted", "error");
                return;
            }

            void playCurrentSource();
        });

        const retry = () => {
            if (els.loadingMusic.paused) resumeMusicFromGesture();
        };

        document.addEventListener("pointerdown", retry, { once: true });
        document.addEventListener("keydown", retry, { once: true });
        void playCurrentSource();
        return true;
    }

    function extractYouTubeVideoId(value) {
        const raw = String(value || "").trim();
        if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
        try {
            const url = new URL(raw);
            const host = url.hostname.toLowerCase().replace(/^www\./, "");
            if (host === "youtu.be") {
                const id = url.pathname.split("/").filter(Boolean)[0] || "";
                return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
            }
            if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
                if (url.pathname === "/watch") {
                    const id = url.searchParams.get("v") || "";
                    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
                }
                const parts = url.pathname.split("/").filter(Boolean);
                if (["embed", "shorts", "live"].includes(parts[0])) {
                    const id = parts[1] || "";
                    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
                }
            }
        } catch (_) {}
        return "";
    }

    function loadYouTubeApi(youtube) {
        if (window.YT?.Player) return Promise.resolve(window.YT);
        if (state.youtubeApiPromise) return state.youtubeApiPromise;

        const apiScript = typeof youtube.apiScript === "string" ? youtube.apiScript.trim() : "";

        try {
            const apiUrl = new URL(apiScript);
            if (apiUrl.protocol !== "https:"
                || apiUrl.hostname !== "www.youtube.com"
                || apiUrl.pathname !== "/iframe_api"
                || apiUrl.search
                || apiUrl.hash) {
                return Promise.reject(new Error("YouTube API URL is not allowed"));
            }
        } catch (_) {
            return Promise.reject(new Error("YouTube API URL is not allowed"));
        }

        state.youtubeApiPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-ncore-youtube-api="1"]');
            const previousReady = window.onYouTubeIframeAPIReady;
            let settled = false;

            const finish = () => {
                if (settled) return;
                if (!window.YT?.Player) return;
                settled = true;
                resolve(window.YT);
            };

            window.onYouTubeIframeAPIReady = () => {
                try {
                    if (typeof previousReady === "function") previousReady();
                } finally {
                    finish();
                }
            };

            if (!existing) {
                const script = document.createElement("script");
                script.src = apiScript;
                script.async = true;
                script.dataset.ncoreYoutubeApi = "1";
                script.onerror = () => {
                    if (settled) return;
                    settled = true;
                    reject(new Error("Unable to load YouTube IFrame API"));
                };
                document.head.appendChild(script);
            }

            window.setTimeout(() => {
                if (window.YT?.Player) {
                    finish();
                    return;
                }
                if (!settled) {
                    settled = true;
                    reject(new Error("YouTube IFrame API timeout"));
                }
            }, 10000);
        });

        return state.youtubeApiPromise;
    }

    function startYouTubeFallback(music, reason = "youtube-unavailable") {
        if (state.youtubePlaybackConfirmed) return;
        setAudioStatus("error", reason, "error");
    }

    async function startYouTubeMusic(music) {
        const youtube = music.youtube || {};
        const urls = Array.isArray(youtube.urls) ? youtube.urls : [];
        const ids = urls.map(extractYouTubeVideoId).filter(Boolean);
        if (!els.youtubeMusic || ids.length === 0) return false;

        state.activeMusicMode = "youtube";
        state.youtubePlaybackConfirmed = false;
        state.youtubeIndex = 0;
        state.youtubeErrorCount = 0;
        setAudioStatus("idle", "youtube-api-loading");

        try {
            const YT = await loadYouTubeApi(youtube);

            if (state.youtubePlayer?.destroy) {
                try { state.youtubePlayer.destroy(); } catch (_) {}
                state.youtubePlayer = null;
            }

            const playerVars = {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                rel: 0
            };

            if ((window.location.protocol === "http:" || window.location.protocol === "https:")
                && window.location.origin) {
                playerVars.origin = window.location.origin;
                playerVars.widget_referrer = window.location.href;
            }

            state.youtubePlayer = new YT.Player("youtubeMusic", {
                width: 200,
                height: 200,
                videoId: ids[0],
                playerVars,
                events: {
                    onReady(event) {
                        try {
                            const iframe = event.target.getIframe?.();
                            iframe?.setAttribute?.("aria-hidden", "true");
                            iframe?.setAttribute?.("referrerpolicy", "strict-origin-when-cross-origin");
                            iframe?.setAttribute?.("allow", "autoplay; encrypted-media");
                            event.target.setVolume(Math.round(state.musicVolume * 100));
                            event.target.unMute();
                            setAudioStatus("idle", "youtube-player-ready");

                            window.setTimeout(() => {
                                try {
                                    if (!state.musicPaused) event.target.playVideo();
                                } catch (error) {
                                    if (config.debug) console.warn("[NCore Loading] YouTube delayed play failed", error);
                                    startYouTubeFallback(music, "youtube-play-failed");
                                }
                            }, 150);
                        } catch (error) {
                            if (config.debug) console.warn("[NCore Loading] YouTube ready failed", error);
                            startYouTubeFallback(music, "youtube-ready-failed");
                        }
                    },
                    onStateChange(event) {
                        const value = Number(event.data);
                        const playing = Number(YT.PlayerState?.PLAYING ?? 1);
                        const ended = Number(YT.PlayerState?.ENDED ?? 0);

                        if (value === ended) {
                            if (ids.length > 1 || music.loopPlaylist !== false) {
                                state.youtubeIndex = (state.youtubeIndex + 1) % ids.length;
                                try {
                                    event.target.loadVideoById(ids[state.youtubeIndex]);
                                } catch (_) {
                                    startYouTubeFallback(music, "youtube-next-video-failed");
                                }
                            }
                            return;
                        }

                        if (value !== playing) return;

                        if (state.musicPaused) {
                            try { event.target.pauseVideo(); } catch (_) {}
                            return;
                        }

                        state.youtubePlaybackConfirmed = true;
                        state.youtubeErrorCount = 0;
                        markMusicStarted("youtube");

                        if (state.youtubeFallbackTimer) {
                            window.clearTimeout(state.youtubeFallbackTimer);
                            state.youtubeFallbackTimer = null;
                        }

                        stopBuiltInMenuMusic();
                    },
                    onAutoplayBlocked() {
                        requestMusicGesture("youtube-autoplay-blocked");
                    },
                    onError(event) {
                        const errorCode = Number(event.data);
                        const reason = errorCode === 153
                            ? "youtube-client-identity-153"
                            : `youtube-error-${Number.isFinite(errorCode) ? errorCode : "unknown"}`;

                        state.youtubeErrorCount += 1;
                        setAudioStatus("error", reason, "error");

                        if (youtube.retryNextVideoOnError !== false
                            && ids.length > 1
                            && state.youtubeErrorCount < ids.length) {
                            state.youtubeIndex = (state.youtubeIndex + 1) % ids.length;
                            try {
                                event.target.loadVideoById(ids[state.youtubeIndex]);
                                event.target.playVideo();
                                return;
                            } catch (_) {}
                        }

                        if (config.debug) console.warn("[NCore Loading] YouTube player error", event.data);
                        startYouTubeFallback(music, reason);
                    }
                }
            });

            const retry = () => {
                resumeMusicFromGesture();
            };
            document.addEventListener("pointerdown", retry, { once: true });
            document.addEventListener("keydown", retry, { once: true });

            state.youtubeFallbackTimer = window.setTimeout(
                () => startYouTubeFallback(music, "youtube-playback-timeout"),
                Math.max(4000, Number(youtube.playbackConfirmTimeoutMs) || 8000)
            );

            return true;
        } catch (error) {
            if (config.debug) console.warn("[NCore Loading] YouTube API unavailable", error);
            startYouTubeFallback(music, "youtube-api-unavailable");
            return false;
        }
    }

    function prepareAudioForUnload() {
        if (state.audioTeardownPrepared) return;
        state.audioTeardownPrepared = true;

        if (state.youtubeFallbackTimer) {
            window.clearTimeout(state.youtubeFallbackTimer);
            state.youtubeFallbackTimer = null;
        }
        if (state.menuMusicStopTimer) {
            window.clearTimeout(state.menuMusicStopTimer);
            state.menuMusicStopTimer = null;
        }

        try {
            if (els.loadingMusic) {
                els.loadingMusic.pause?.();
                els.loadingMusic.removeAttribute("src");
                els.loadingMusic.load?.();
            }
        } catch (_) {}

        revokeLocalAudioObjectUrl();

        try { state.youtubePlayer?.pauseVideo?.(); } catch (_) {}
    }

    async function configureMusic() {
        const music = config.music || {};

        if (music.enabled === false) {
            setAudioStatus("idle", "music-disabled");
            return;
        }

        setAudioStatus("idle", `mode-${String(music.mode || "file")}`);

        if (music.mode === "youtube" && await startYouTubeMusic(music)) return;
        if (music.mode === "file" && startAudioPlaylist(music.files, music, true)) return;
        if (music.mode === "url" && startAudioPlaylist(music.urls, music, false)) return;

        setAudioStatus("error", "no-audio-source-configured", "error");
    }

    function subscribeToNanosLoading() {
        if (!window.Events || typeof window.Events.Subscribe !== "function") {
            if (config.debug) {
                console.warn("[NCore Loading] NANOS Events bridge unavailable (preview mode).");
            }

            return;
        }

        window.Events.Subscribe("UpdateScreen", queueLoadingScreenUpdate);
    }

    async function copyTextToClipboard(value) {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                return true;
            }
        } catch (_) {}

        const input = document.createElement("textarea");
        input.value = value;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        input.style.pointerEvents = "none";
        document.body.appendChild(input);

        try {
            input.focus();
            input.select();
            return document.execCommand("copy");
        } catch (_) {
            return false;
        } finally {
            input.remove();
        }
    }

    function showOfficialLinkFeedback(node, labelPath, fallbackLabel) {
        if (!node) return;

        if (state.officialLinkFeedbackTimer) {
            window.clearTimeout(state.officialLinkFeedbackTimer);
            state.officialLinkFeedbackTimer = null;
        }

        node.textContent = text(labelPath, fallbackLabel);
        state.officialLinkFeedbackTimer = window.setTimeout(() => {
            applyStaticLanguage();
            state.officialLinkFeedbackTimer = null;
        }, 1400);
    }

    function bindOfficialLinks() {
        const links = config.officialLinks || {};
        const discordUrl = typeof links.discordUrl === "string" ? links.discordUrl.trim() : "";
        const githubUrl = typeof links.githubUrl === "string" ? links.githubUrl.trim() : "";

        const bind = (node, value) => {
            if (!node || !value) return false;

            try {
                const url = new URL(value);
                if (url.protocol !== "https:") return false;

                node.dataset.url = url.href;
                node.title = url.href;
                node.addEventListener("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const copied = await copyTextToClipboard(url.href);
                    showOfficialLinkFeedback(
                        node,
                        copied ? "static.officialLinkCopiedLabel" : "static.officialLinkCopyFailedLabel",
                        copied ? "Link copied" : "Copy failed"
                    );
                });

                return true;
            } catch (_) {
                return false;
            }
        };

        const discordBound = bind(els.officialDiscordLink, discordUrl);
        const githubBound = bind(els.officialGitLink, githubUrl);
        if (els.officialLinks) {
            els.officialLinks.hidden = !discordBound && !githubBound;
        }
        if (els.officialDiscordLink) els.officialDiscordLink.hidden = !discordBound;
        if (els.officialGitLink) els.officialGitLink.hidden = !githubBound;
    }

    function applyInterfaceOptions() {
        if (config.interface?.showTimeline === false) {
            els.stageTimeline.hidden = true;
        }

        if (config.brand?.showNCoreControlBranding === false && els.ncoreControlBrand) {
            els.ncoreControlBrand.hidden = true;
        }
    }

    async function bootstrap() {
        state.language = await resolveLanguage();
        applyStaticLanguage();
        applyTheme();
        configureBackground();
        rotateTips();
        applyInterfaceOptions();
        bindOfficialLinks();
        waitForLoadingScreenInfo();
        bindMusicControls();
        void configureMusic();
        subscribeToNanosLoading();

        if (!window.Events && config.debug) {
            queueLoadingScreenUpdate(
                text("preview.primary", "Loading assets"),
                text("preview.secondary", "Preparing the environment"),
                31,
                100,
                62,
                100,
                Stage.LoadingAssets
            );
        }
    }

    window.addEventListener("beforeunload", () => {
        prepareAudioForUnload();
    }, { once: true });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            void bootstrap();
        }, { once: true });
    } else {
        void bootstrap();
    }
})();
