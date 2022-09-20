import { MacrosDTO } from "common/types";
import type { PluginMetaData } from "./plugin";

export type SettingsV4 = {
    version: 4;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    },
    assets: {
        images: "sd" | "hd";
        terrain: "sd" | "hd";
    },
    audio: {
        global: number;
        music: number;
        sound: number;
    },
    graphics: {
        antialias: boolean;
        pixelRatio: "high" | "med" | "low";
        anisotropy: "high" | "med" | "low";
        terrainShadows: boolean;
    },
    game: {
        stopFollowingOnClick: boolean,
    },
    util: {
        sanityCheckReplayCommands: boolean,
        debugMode: boolean
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    }
};

export type SettingsV5 = {
    version: 5;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    },
    assets: {
        images: "sd" | "hd";
        terrain: "sd" | "hd";
        preload: boolean;
        enable3dAssets: boolean;
    },
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean,
    },
    graphics: {
        antialias: boolean;
        pixelRatio: "high" | "med" | "low";
        anisotropy: "high" | "med" | "low";
        terrainShadows: boolean;
    },
    game: {
        sceneController: string;
        minimapSize: number;
    },
    util: {
        sanityCheckReplayCommands: boolean,
        debugMode: boolean
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    },
    macros: MacrosDTO
};


export type SettingsV6 = {
    version: 6;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    },
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean,
    },
    graphics: {
        pixelRatio: number;
        useHD2: "auto" | "ignore" | "force";
        preload: boolean;
        cursorSize: number;
    },
    minimap: {
        mode: "2d" | "3d";
        position: [number, number];
        rotation: [number, number, number];
        scale: number;
        enabled: boolean;
        opacity: number;
        softEdges: boolean;
        interactive: boolean;
        drawCamera: boolean;
    },
    input: {
        sceneController: string;
        sandBoxMode: boolean;
        dampingFactor: number;
        movementSpeed: number;
        rotateSpeed: number;
        cameraShakeStrength: number;
        zoomLevels: [number, number, number];
        unitSelection: boolean;
    },
    utilities: {
        sanityCheckReplayCommands: boolean,
        debugMode: boolean,
        detectMeleeObservers: boolean,
        detectMeleeObserversThreshold: number,
        alertDesynced: boolean,
        alertDesyncedThreshold: number,
        logLevel: "debug" | "verbose" | "info" | "warn" | "error",
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    },
    postprocessing: {
        anisotropy: number;
        antialias: number;
        toneMapping: number;
        bloom: number;
        brightness: number;
        contrast: number;
        fogOfWar: number;
    },
    postprocessing3d: {
        anisotropy: number;
        antialias: number;
        toneMapping: number;
        bloom: number;
        brightness: number;
        contrast: number;
        depthFocalLength: number;
        depthBokehScale: number;
        depthBlurQuality: number;
        depthFocalRange: number;
        fogOfWar: number;
        envMap: number;
        sunlightDirection: [number, number, number];
        sunlightColor: string;
        sunlightIntensity: number;
        shadowIntensity: number;
        shadowQuality: number;
    },
    macros: MacrosDTO
};

export type Settings = SettingsV6;

export type SettingsMeta = {
    data: Settings;
    errors: string[];
    phrases: Record<string, string>;
    enabledPlugins: PluginMetaData[];
    disabledPlugins: PluginMetaData[];
    initialInstall: boolean;
    /**
     * Whether the starcraft directory is a CASC storage or direct filesystem
     */
    isCascStorage: boolean;
};

export type SessionSettingsData = Pick<Settings, "audio" | "input" | "minimap" | "postprocessing" | "postprocessing3d">;