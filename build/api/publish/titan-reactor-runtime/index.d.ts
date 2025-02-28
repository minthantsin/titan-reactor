
        import Chk from "bw-chk"
import React from "react"
import { CompressedTexture, BufferAttribute, DataArrayTexture, CubeTexture, DataTexture, Texture } from "three";



//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/** @internal */
declare function chunk(arr: Int32Array, n: number): Int32Array[];

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @internal
 */
declare function convertIcons({ cmdIcons, gameIcons, raceInsetIcons, wireframeIcons, workerIcons, }: Required<SystemReadyMessage["assets"]>): {
    cmdIcons: string[];
    wireframeIcons: string[];
    raceInsetIcons: {
        protoss: string;
        terran: string;
        zerg: string;
    };
    workerIcons: {
        protoss: string;
        terran: string;
        zerg: string;
        apm: string;
    };
    gameIcons: {
        energy: string;
        minerals: string;
        protoss: string;
        terran: string;
        zerg: string;
        vespeneProtoss: string;
        vespeneTerran: string;
        vespeneZerg: string;
    };
};

//D:/dev/titan-reactor/src/renderer/plugins/plugin-system-ui.ts

/** @internal */
interface SystemReadyMessage {
    initialStore: PluginStateMessage;
    plugins: PluginMetaData[];
    assets: Pick<Assets, "bwDat" | "gameIcons" | "cmdIcons" | "raceInsetIcons" | "workerIcons" | "wireframeIcons">;
    enums: any;
}

//D:/dev/titan-reactor/src/renderer/plugins/plugin-system-ui.ts

/**
 * @resolve
 */
/** @internal */
interface PluginStateMessage {
    language: string;
    [UI_STATE_EVENT_DIMENSIONS_CHANGED]: MinimapDimensions;
    [UI_STATE_EVENT_SCREEN_CHANGED]: {
        screen: SceneStateID | undefined;
        error: string | undefined;
    };
    [UI_STATE_EVENT_WORLD_CHANGED]: ReturnType<typeof worldPartial>;
    [UI_STATE_EVENT_ON_FRAME]: number;
    [UI_STATE_EVENT_PRODUCTION]: {
        playerData: Int32Array;
        unitProduction: Int32Array[];
        research: Int32Array[];
        upgrades: Int32Array[];
    };
    [UI_STATE_EVENT_UNITS_SELECTED]: DumpedUnit[] | DeepPartial<Unit>[];
}

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_DIMENSIONS_CHANGED = "dimensions";

//D:/dev/titan-reactor/src/renderer/render/minimap-dimensions.ts
/** @internal */
interface MinimapDimensions {
    matrix: number[];
    minimapWidth: number;
    minimapHeight: number;
}

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_SCREEN_CHANGED = "screen";

//D:/dev/titan-reactor/src/renderer/scenes/scene.ts
/** @internal */
declare type SceneStateID = "@home" | "@loading" | "@replay" | "@map" | "@iscriptah" | "@interstitial";

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_WORLD_CHANGED = "world";

//D:/dev/titan-reactor/src/renderer/plugins/plugin-system-ui.ts

/** @internal */
declare const worldPartial: (world: ReplayAndMapStore) => {
    map: {
        title: string;
        description: string;
        width: number;
        height: number;
        tileset: number;
        tilesetName: string;
    } | undefined;
    replay: {
        isBroodwar: number;
        gameName: string;
        mapName: string;
        gameType: number;
        gameSubtype: number;
        players: ReplayPlayer[];
        frameCount: number;
        randomSeed: number;
        ancillary: {
            campaignId: number;
            commandByte: number;
            playerBytes: Buffer;
            unk1: number;
            playerName: Buffer;
            gameFlags: number;
            mapWidth: number;
            mapHeight: number;
            activePlayerCount: number;
            slotCount: number;
            gameSpeed: number;
            gameState: number;
            unk2: number;
            tileset: number;
            replayAutoSave: number;
            computerPlayerCount: number;
            unk3: number;
            unk4: number;
            unk5: number;
            unk6: number;
            victoryCondition: number;
            resourceType: number;
            useStandardUnitStats: number;
            fogOfWarEnabled: number;
            createInitialUnits: number;
            useFixedPositions: number;
            restrictionFlags: number;
            alliesEnabled: number;
            teamsEnabled: number;
            cheatsEnabled: number;
            tournamentMode: number;
            victoryConditionValue: number;
            startingMinerals: number;
            startingGas: number;
            unk7: number;
        };
    } | undefined;
};

//D:/dev/titan-reactor/src/renderer/stores/replay-and-map-store.ts

/** @internal */
interface ReplayAndMapStore {
    type: "map" | "replay" | "live";
    live: boolean;
    map?: Chk;
    replay?: Replay;
    mapImage?: HTMLCanvasElement;
    reset: () => void;
}

//D:/dev/titan-reactor/src/renderer/process-replay/parse-replay.ts

/**
 * @public
 * A replay file structure containing header information and raw command and map data
 */
export declare type Replay = Awaited<ReturnType<typeof parseReplay>>;

//D:/dev/titan-reactor/src/renderer/process-replay/parse-replay.ts
/// <reference types="node" />
/** @internal */
declare const parseReplay: (buf: Buffer) => Promise<{
    version: number;
    rawHeader: Buffer;
    header: {
        isBroodwar: number;
        gameName: string;
        mapName: string;
        gameType: number;
        gameSubtype: number;
        players: ReplayPlayer[];
        frameCount: number;
        randomSeed: number;
        ancillary: {
            campaignId: number;
            commandByte: number;
            playerBytes: Buffer;
            unk1: number;
            playerName: Buffer;
            gameFlags: number;
            mapWidth: number;
            mapHeight: number;
            activePlayerCount: number;
            slotCount: number;
            gameSpeed: number;
            gameState: number;
            unk2: number;
            tileset: number;
            replayAutoSave: number;
            computerPlayerCount: number;
            unk3: number;
            unk4: number;
            unk5: number;
            unk6: number;
            victoryCondition: number;
            resourceType: number;
            useStandardUnitStats: number;
            fogOfWarEnabled: number;
            createInitialUnits: number;
            useFixedPositions: number;
            restrictionFlags: number;
            alliesEnabled: number;
            teamsEnabled: number;
            cheatsEnabled: number;
            tournamentMode: number;
            victoryConditionValue: number;
            startingMinerals: number;
            startingGas: number;
            unk7: number;
        };
    };
    rawCmds: Buffer;
    chk: Buffer;
    limits: {
        images: number;
        sprites: number;
        thingies: number;
        units: number;
        bullets: number;
        orders: number;
        fogSprites: number;
    };
    stormPlayerToGamePlayer: number[];
}>;

//D:/dev/titan-reactor/src/renderer/process-replay/parse-replay-header.ts
/// <reference types="node" />
/** @internal */
interface ReplayPlayer {
    id: number;
    name: string;
    race: "zerg" | "terran" | "protoss" | "unknown";
    team: number;
    color: string;
    isComputer: boolean;
    isHuman: boolean;
    isActive: boolean;
}

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_ON_FRAME = "frame";

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_PRODUCTION = "production";

//D:/dev/titan-reactor/src/renderer/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_UNITS_SELECTED = "units";

//D:/dev/titan-reactor/src/renderer/core/unit.ts

/**
 * @public
 * Extended unit information.
 */
export interface DumpedUnit extends Partial<Unit> {
    remainingTrainTime?: number;
    upgrade?: {
        id: number;
        level: number;
        time: number;
    };
    research?: {
        id: number;
        time: number;
    };
    loaded?: {
        id: number;
        typeId: number;
        hp: number;
    }[];
    buildQueue?: number[];
}

//D:/dev/titan-reactor/src/renderer/core/unit.ts

/**
 * @public
 * A unit (and its state) in the game.
 */
export interface Unit extends UnitStruct {
    extras: {
        recievingDamage: number;
        selected?: boolean;
        dat: UnitDAT;
    };
}

//D:/dev/titan-reactor/src/common/types/structs/unit-struct.ts

/** @internal */
interface UnitStruct extends FlingyStruct {
    id: number;
    typeId: number;
    owner: number;
    energy: number;
    shields: number;
    statusFlags: number;
    remainingBuildTime: number;
    resourceAmount: number;
    order: number | null;
    kills: number;
    orderTargetAddr: number;
    orderTargetX: number;
    orderTargetY: number;
    orderTargetUnit: number;
    /**
     * @internal
     */
    subunit: UnitStruct | null;
    subunitId: number | null;
}

//D:/dev/titan-reactor/src/common/types/structs/flingy-struct.ts

/** @internal */
interface FlingyStruct extends ThingyStruct {
    x: number;
    y: number;
    direction: number;
    moveTargetX: number;
    moveTargetY: number;
    nextMovementWaypointX: number;
    nextMovementWaypointY: number;
    nextTargetWaypointX: number;
    nextTargetWaypointY: number;
    movementFlags: number;
}

//D:/dev/titan-reactor/src/common/types/structs/thingy-struct.ts
/** @internal */
interface ThingyStruct {
    hp: number;
    /**
     * @internal
     */
    spriteIndex: number;
}

//D:/dev/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export interface UnitDAT extends UnitDATIncomingType {
}

//D:/dev/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export interface UnitDATIncomingType {
    index: number;
    flingy: any;
    subUnit1: number;
    subUnit2: number;
    infestation: number[];
    constructionImage: number;
    direction: number;
    shieldsEnabled: boolean;
    shields: number;
    hp: number;
    elevationLevel: number;
    groundWeapon: number;
    airWeapon: number;
    sightRange: number;
    armorUpgrade: number;
    unitSize: number;
    armor: number;
    readySound: number;
    whatSound: number[];
    yesSound: number[];
    pissSound: number[];
    whatSoundStart: number;
    whatSoundEnd: number;
    yesSoundStart: number;
    yesSoundEnd: number;
    pissSoundStart: number;
    pissSoundEnd: number;
    placementWidth: number;
    placementHeight: number;
    addonHorizontal: number;
    addonVertical: number;
    unitSizeLeft: number;
    unitSizeUp: number;
    unitSizeRight: number;
    unitSizeDown: number;
    portrait: number;
    mineralCost: number;
    vespeneCost: number;
    buildTime: number;
    requirements: number;
    starEditGroupFlags: number;
    supplyProvided: number;
    supplyRequired: number;
    spaceRequired: number;
    spaceProvided: number;
    buildScore: number;
    destroyScore: number;
    starEditAvailabilityFlags: number;
}

//D:/dev/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export declare class UnitDAT implements UnitDAT {
    specialAbilityFlags: number;
    starEditGroupFlags: number;
    name: string;
    isBuilding: boolean;
    isAddon: boolean;
    isFlyer: boolean;
    isResourceMiner: boolean;
    isTurret: boolean;
    isFlyingBuilding: boolean;
    isHero: boolean;
    regenerates: boolean;
    animatedIdle: boolean;
    cloakable: boolean;
    twoUnitsInOneEgg: boolean;
    singleEntity: boolean;
    isResourceDepot: boolean;
    isResourceContainer: boolean;
    isRobotic: boolean;
    isDetector: boolean;
    isOrganic: boolean;
    requiresCreep: boolean;
    unusedFlag: boolean;
    requiresPsi: boolean;
    burrowable: boolean;
    isSpellcaster: boolean;
    permanentCloak: boolean;
    pickupItem: boolean;
    ignoreSupplyCheck: boolean;
    useMediumOverlays: boolean;
    useLargeOverlays: boolean;
    battleReactions: boolean;
    fullAutoAttack: boolean;
    invincible: boolean;
    isMechanical: boolean;
    producesUnits: boolean;
    isZerg: boolean;
    isTerran: boolean;
    isProtoss: boolean;
    constructor(data: UnitDATIncomingType);
}

//D:/dev/titan-reactor/src/common/types/utils/deep-partial.ts
/** @internal */
declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

//D:/dev/titan-reactor/src/common/types/plugin.ts

/** @internal */
interface PluginMetaData extends PluginPackage {
    nativeSource?: string | null;
    path: string;
    date?: Date;
    readme?: string;
    indexFile: string;
    externMethods: string[];
    hooks: string[];
    isSceneController: boolean;
    apiVersion: string;
}

//D:/dev/titan-reactor/src/common/types/plugin.ts

/** @internal */
interface PluginPackage {
    name: string;
    id: string;
    version: string;
    author?: string | {
        name?: string;
        email?: string;
        username?: string;
    };
    keywords?: string[];
    description?: string;
    repository?: string | {
        type?: string;
        url?: string;
    };
    peerDependencies?: Record<string, string>;
    config?: PluginConfig;
    permissions?: string[];
}

//D:/dev/titan-reactor/src/common/types/plugin.ts

/** @internal */
declare type PluginConfig = Record<string, FieldDefinition>;

//D:/dev/titan-reactor/src/common/types/fields.ts

/** @internal */
interface FieldDefinition<T = unknown> {
    /**
     * The type is usually inferred except for the case of Leva Plugins.
     */
    type?: string;
    onChange?: (value: any, path: string, context: any) => void;
    folder?: string;
    label?: string;
    value: T;
    step?: number;
    min?: number;
    max?: number;
    options?: string[] | Record<string, string>;
}

//D:/dev/titan-reactor/src/renderer/image/assets.ts

/**
 * @public
 * Most game assets excepting sprites / images.
 */
export declare type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
} & Partial<Awaited<ReturnType<typeof generateUIIcons>>>;

//D:/dev/titan-reactor/src/renderer/image/assets.ts

/** @internal */
declare const initializeAssets: (directories: {
    starcraft: string;
    assets: string;
}) => Promise<{
    selectionCircles: {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    }[];
    minimapConsole: {
        clock: import("three").CompressedTexture;
        square: import("three").CompressedTexture;
    };
    loadImageAtlas(imageId: number, bwDat: BwDAT): {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    } | undefined;
    getImageAtlas(imageId: number): AnimAtlas | undefined;
    hasImageAtlas(imageId: number): boolean;
    loadImageAtlasAsync(imageId: number, bwDat: BwDAT): Promise<void>;
    skyBox: CubeTexture;
    refId: (id: number) => number;
    resetAssetCache: () => void;
    arrowIconsGPU: LegacyGRP;
    hoverIconsGPU: LegacyGRP;
    dragIconsGPU: LegacyGRP;
    remaining: number;
    atlases: {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    }[];
}>;

//D:/dev/titan-reactor/src/common/types/image.ts

/** @internal */
declare enum UnitTileScale {
    SD = 1,
    HD2 = 2,
    HD = 4
}

//D:/dev/titan-reactor/src/common/bwdat/bw-dat.ts

/**
 * @public
 */
export interface BwDAT {
    iscript: IScriptDATType;
    sounds: SoundDAT[];
    tech: TechDataDAT[];
    upgrades: UpgradeDAT[];
    orders: OrderDAT[];
    units: UnitDAT[];
    images: ImageDAT[];
    los: LoDAT[];
    sprites: SpriteDAT[];
    weapons: WeaponDAT[];
    grps: GrpSprite[];
}

//D:/dev/titan-reactor/src/common/types/iscript.ts

/** @internal */
interface IScriptDATType {
    iscripts: Record<number, IScriptProgram>;
    animations: Record<number, IScriptAnimation>;
}

//D:/dev/titan-reactor/src/common/types/iscript.ts

/** @internal */
interface IScriptProgram {
    id: number;
    type: number;
    offset: number;
    offsets: number[];
}

//D:/dev/titan-reactor/src/common/types/iscript.ts

/** @internal */
declare type IScriptAnimation = IScriptOperations[];

//D:/dev/titan-reactor/src/common/types/iscript.ts

/** @internal */
declare type IScriptOperations = [string, number[]];

//D:/dev/titan-reactor/src/common/bwdat/sounds-dat.ts

/**
 * @public
 */
export interface SoundDAT {
    file: string;
    priority: number;
    flags: number;
    race: number;
    minVolume: number;
}

//D:/dev/titan-reactor/src/common/bwdat/tech-data-dat.ts

/**
 * @public
 */
export interface TechDataDAT {
    mineralCost: number;
    vespeneCost: number;
    researchTime: number;
    energyRequired: number;
    researchRequirements: number;
    useRequirements: number;
    icon: number;
    name: string;
    race: number;
    researched: number;
}

//D:/dev/titan-reactor/src/common/bwdat/upgrades-dat.ts

/**
 * @public
 */
export interface UpgradeDAT {
    mineralCostBase: number;
    mineralCostFactor: number;
    vespeneCostFactor: number;
    vespeneCostBase: number;
    researchTimeBase: number;
    researchTimeFactor: number;
    requirements: number;
    icon: number;
    name: string;
    maxRepeats: number;
    race: number;
}

//D:/dev/titan-reactor/src/common/bwdat/orders-dat.ts

/**
 * @public
 */
export interface OrderDAT {
    name: string;
}

//D:/dev/titan-reactor/src/common/bwdat/images-dat.ts

/**
 * @public
 */
export interface ImageDAT {
    index: number;
    grpFile: string;
    name: string;
    grp: number;
    gfxTurns: number;
    clickable: number;
    useFullIscript: number;
    drawIfCloaked: number;
    drawFunction: number;
    remapping: number;
    iscript: number;
    shieldOverlay: number;
    attackOverlay: number;
    damageOverlay: number;
    specialOverlay: number;
    landingDustOverlay: number;
    liftOffDustOverlay: number;
}

//D:/dev/titan-reactor/src/common/bwdat/parse-lo.ts
/// <reference types="node" />
/**
 * @public
 */
export declare type LoDAT = number[][][];

//D:/dev/titan-reactor/src/common/bwdat/sprites-dat.ts

/**
 * @public
 */
export interface SpriteDAT {
    image: ImageDAT;
    name: string;
    index: number;
    healthBar: number;
    visible: number;
    selectionCircle: {
        size: number;
        index: number;
    };
    selectionCircleOffset: number;
}

//D:/dev/titan-reactor/src/common/bwdat/weapons-dat.ts

/**
 * @public
 */
export interface WeaponDAT {
    index: number;
    name: string;
    flingy: FlingyDAT;
    targetFlags: number;
    minRange: number;
    maxRange: number;
    damageUpgrade: number;
    damageType: number;
    weaponBehavior: number;
    lifetime: number;
    explosionType: number;
    innerSplashRange: number;
    mediumSplashRange: number;
    outerSplashRange: number;
    damageAmount: number;
    damageBonus: number;
    weaponCooldown: number;
    damageFactor: number;
    attackAngle: number;
    launchSpin: number;
    forwardOffset: number;
    upwardOffset: number;
}

//D:/dev/titan-reactor/src/common/bwdat/flingy-dat.ts

/**
 * @public
 */
export interface FlingyDAT {
    sprite: SpriteDAT;
    speed: number;
    acceleration: number;
    haltDistance: number;
    turnRadius: number;
}

//D:/dev/titan-reactor/src/common/types/anim-grp.ts

/** @internal */
declare type GrpSprite = {
    w: number;
    h: number;
    frames: AnimFrame[];
    maxFrameH: number;
    maxFramew: number;
};

//D:/dev/titan-reactor/src/common/types/anim-grp.ts
/// <reference types="node" />
/** @internal */
declare type AnimFrame = {
    x: number;
    y: number;
    w: number;
    h: number;
    xoff: number;
    yoff: number;
};

//D:/dev/titan-reactor/src/renderer/image/atlas/load-anim-atlas.ts

/** @internal */
declare type AnimAtlas = ReturnType<typeof loadAnimAtlas>;

//D:/dev/titan-reactor/src/renderer/image/atlas/load-anim-atlas.ts

/** @internal */
declare const loadAnimAtlas: (buf: Buffer, imageIndex: number, scale: Exclude<UnitTileScale, "SD">) => {
    isHD: boolean;
    isHD2: boolean;
    diffuse: import("three").CompressedTexture;
    imageIndex: number;
    frames: {
        x: number;
        y: number;
        w: number;
        h: number;
        xoff: number;
        yoff: number;
    }[];
    uvPos: {
        pos: BufferAttribute;
        uv: BufferAttribute;
        flippedPos: BufferAttribute;
        flippedUv: BufferAttribute;
    }[];
    uvPosDataTex: DataArrayTexture;
    textureWidth: number;
    textureHeight: number;
    spriteWidth: number;
    spriteHeight: number;
    unitTileScale: UnitTileScale;
    teammask: import("three").CompressedTexture | undefined;
    hdLayers: {
        emissive: import("three").CompressedTexture | undefined;
    };
    dispose(): void;
};

//D:/dev/titan-reactor/src/renderer/image/atlas/legacy-grp.ts

/** @internal */
declare class LegacyGRP {
    width: number;
    height: number;
    grpWidth: number;
    grpHeight: number;
    texture: DataTexture;
    teamcolor?: DataTexture;
    frames: {
        x: number;
        y: number;
        grpX: number;
        grpY: number;
        w: number;
        h: number;
    }[];
    constructor();
    load({ readGrp, imageDef, palettes, }: {
        readGrp: () => Promise<Buffer>;
        imageDef: ImageDAT;
        palettes: Palettes;
    }, stride?: number): Promise<this>;
    dispose(): void;
}

//D:/dev/titan-reactor/src/renderer/image/atlas/legacy-grp.ts

/** @internal */
declare type Palettes = Uint8Array[] & {
    dark?: Buffer;
    light?: Buffer;
};

//D:/dev/titan-reactor/src/renderer/image/generate-icons/generate-icons.ts

/** @internal */
declare const generateUIIcons: (readFile: ReadFile) => Promise<{
    cmdIcons: ArrayBuffer[];
    gameIcons: {
        minerals: Blob;
        vespeneZerg: Blob;
        vespeneTerran: Blob;
        vespeneProtoss: Blob;
        zerg: Blob;
        terran: Blob;
        protoss: Blob;
        energy: Blob;
    };
    raceInsetIcons: {
        zerg: Blob;
        terran: Blob;
        protoss: Blob;
    };
    workerIcons: {
        apm: ArrayBuffer | SharedArrayBuffer;
        terran: ArrayBuffer | SharedArrayBuffer;
        zerg: ArrayBuffer | SharedArrayBuffer;
        protoss: ArrayBuffer | SharedArrayBuffer;
    };
}>;

//D:/dev/titan-reactor/src/common/types/file.ts
/// <reference types="node" />
/** @internal */
declare type ReadFile = (filename: string) => Promise<Buffer>;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Enums and data for game types.
 */
export declare const enums: any;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/** @internal */
interface Component {
    pluginId: string;
    id: number;
    order: number | undefined;
    messageHandler: EventTarget;
    JSXElement: React.FC<any>;
    snap: string;
    screen: string;
}

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/** @internal */
declare type StateMessage = Partial<PluginStateMessage>;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Use the translation function to translate a string
 */
export declare const useLocale: () => string | undefined;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * The replay header information.
 */
export declare const useReplay: () => {
    isBroodwar: number;
    gameName: string;
    mapName: string;
    gameType: number;
    gameSubtype: number;
    players: ReplayPlayer[];
    frameCount: number;
    randomSeed: number;
    ancillary: {
        campaignId: number;
        commandByte: number;
        playerBytes: Buffer;
        unk1: number;
        playerName: Buffer;
        gameFlags: number;
        mapWidth: number;
        mapHeight: number;
        activePlayerCount: number;
        slotCount: number;
        gameSpeed: number;
        gameState: number;
        unk2: number;
        tileset: number;
        replayAutoSave: number;
        computerPlayerCount: number;
        unk3: number;
        unk4: number;
        unk5: number;
        unk6: number;
        victoryCondition: number;
        resourceType: number;
        useStandardUnitStats: number;
        fogOfWarEnabled: number;
        createInitialUnits: number;
        useFixedPositions: number;
        restrictionFlags: number;
        alliesEnabled: number;
        teamsEnabled: number;
        cheatsEnabled: number;
        tournamentMode: number;
        victoryConditionValue: number;
        startingMinerals: number;
        startingGas: number;
        unk7: number;
    };
} | undefined;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * The map information.
 */
export declare const useMap: () => {
    title: string;
    description: string;
    width: number;
    height: number;
    tileset: number;
    tilesetName: string;
} | undefined;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * The current frame of the replay.
 */
export declare const useFrame: () => number | undefined;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * All players in the current replay.
 */
export declare const usePlayers: () => ReplayPlayer[];

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Returns a function getPlayerInfo that can be used to get resource information about a player.
 */
export declare const usePlayerFrame: () => (id: number) => PlayerInfo;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Player information.
 */
export declare class PlayerInfo {
    _struct_size: number;
    playerId: number;
    playerData: Required<StateMessage>["production"]["playerData"];
    get _offset(): number;
    get minerals(): number;
    get vespeneGas(): number;
    get supply(): number;
    get supplyMax(): number;
    get workerSupply(): number;
    get armySupply(): number;
    get apm(): number;
}

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Returns a function that can be used to get player information.
 */
export declare const usePlayer: () => (playerId: number) => ReplayPlayer | undefined;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Returns user selected units (if any).
 */
export declare const useSelectedUnits: () => {
    extras: {
        dat: UnitDAT;
    };
    id?: number | undefined;
    typeId?: number | undefined;
    owner?: number | undefined;
    energy?: number | undefined;
    shields?: number | undefined;
    statusFlags?: number | undefined;
    remainingBuildTime?: number | undefined;
    resourceAmount?: number | undefined;
    order?: number | null | undefined;
    kills?: number | undefined;
    orderTargetAddr?: number | undefined;
    orderTargetX?: number | undefined;
    orderTargetY?: number | undefined;
    orderTargetUnit?: number | undefined;
    subunit?: {
        id?: number | undefined;
        typeId?: number | undefined;
        owner?: number | undefined;
        energy?: number | undefined;
        shields?: number | undefined;
        statusFlags?: number | undefined;
        remainingBuildTime?: number | undefined;
        resourceAmount?: number | undefined;
        order?: number | null | undefined;
        kills?: number | undefined;
        orderTargetAddr?: number | undefined;
        orderTargetX?: number | undefined;
        orderTargetY?: number | undefined;
        orderTargetUnit?: number | undefined;
        subunit?: any | null | undefined;
        subunitId?: number | null | undefined;
        x?: number | undefined;
        y?: number | undefined;
        direction?: number | undefined;
        moveTargetX?: number | undefined;
        moveTargetY?: number | undefined;
        nextMovementWaypointX?: number | undefined;
        nextMovementWaypointY?: number | undefined;
        nextTargetWaypointX?: number | undefined;
        nextTargetWaypointY?: number | undefined;
        movementFlags?: number | undefined;
        hp?: number | undefined;
        spriteIndex?: number | undefined;
    } | null | undefined;
    subunitId?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;
    direction?: number | undefined;
    moveTargetX?: number | undefined;
    moveTargetY?: number | undefined;
    nextMovementWaypointX?: number | undefined;
    nextMovementWaypointY?: number | undefined;
    nextTargetWaypointX?: number | undefined;
    nextTargetWaypointY?: number | undefined;
    movementFlags?: number | undefined;
    hp?: number | undefined;
    spriteIndex?: number | undefined;
}[];

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Get the icon id for a particular unit type.
 */
export declare const getUnitIcon: (unit: DumpedUnit) => any;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Returns three functions that can be used to get player production information.
 * Units, Upgrades and Research.
 */
export declare const useProduction: () => (((playerId: number) => ({
    typeId: number;
    icon: number;
    count: number;
    progress: number;
    isUnit: boolean;
} | null)[]) | ((playerId: number) => {
    typeId: number;
    icon: number;
    level: number;
    isUpgrade: boolean;
    progress: number;
}[]) | ((playerId: number) => {
    typeId: number;
    icon: number;
    progress: number;
    isResearch: boolean;
}[]))[];

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Converts a frame numer to a time string eg 01:00.
 */
export declare const getFriendlyTime: (frame: number) => string;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 */
export declare const openUrl: (url: string) => void;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Images and game data.
 */
export declare type RuntimeAssets = Pick<SystemReadyMessage["assets"], "bwDat"> & ReturnType<typeof convertIcons>;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Images and game data.
 */
export declare const assets: RuntimeAssets;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * A number that rolls up and down quickly like a casino slot.
 */
export declare const RollingNumber: ({ value, upSpeed, downSpeed, ...props }: {
    value: number;
    upSpeed: number | undefined;
    downSpeed: number | undefined;
}) => JSX.Element;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Receive ipc messages from your native plugin.
 */
export declare const useMessage: (cb?: ((event: any) => void) | undefined, deps?: unknown[]) => void;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Send ipc messages to your native plugin.
 */
export declare const useSendMessage: () => (message: unknown) => void;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Get your users plugin configuration.
 */
export declare const usePluginConfig: () => object;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 * Set a global stylesheet.
 */
export declare const useStyleSheet: (content: string, deps?: never[]) => void;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @public
 */
export declare const proxyFetch: (url: string) => Promise<Response>;

//D:/dev/titan-reactor/src/main/plugins/runtime.tsx

/**
 * @internal
 */
declare const _rc: (pluginId: string, component: Component, JSXElement: React.FC<any>) => void;
        declare global {
            
        }
        