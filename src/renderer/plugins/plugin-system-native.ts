import * as log from "@ipc/log";
import { CameraController, InitializedPluginPackage, NativePlugin, PluginPrototype } from "common/types";
import withErrorMessage from "common/utils/with-error-message";
import { PluginSystemUI } from "./plugin-system-ui";
import { SYSTEM_EVENT_CUSTOM_MESSAGE } from "./events";
import { HOOK_ON_FRAME_RESET, HOOK_ON_GAME_DISPOSED, HOOK_ON_GAME_READY, HOOK_ON_SCENE_PREPARED, HOOK_ON_UNITS_CLEAR_FOLLOWED, HOOK_ON_UNITS_FOLLOWED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_UNFOLLOWED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED, HOOK_ON_TECH_COMPLETED } from "./hooks";
import { Vector3 } from "three";
import { updatePluginsConfig } from "@ipc/plugins";
import { PERMISSION_REPLAY_COMMANDS, PERMISSION_REPLAY_FILE } from "./permissions";
import throttle from "lodash.throttle";
import Janitor from "@utils/janitor";
import { MacroActionEffect, getMacroActionValue, Macro, MacroActionPlugin } from "../command-center/macros";
import { createCompartment } from "@utils/ses-util";


type InternalHookOptions = {
    postFn?: Function;
    async?: boolean;
    hookAuthorPluginId?: string
}

// plugins may register their own custom hooks
class Hook {
    readonly args: string[];
    readonly name: string;
    #opts: InternalHookOptions;

    constructor(name: string, args: string[], opts: InternalHookOptions = {}) {
        this.name = name;
        this.args = args;
        this.#opts = opts;
    }

    isAsync() {
        return this.#opts.async;
    }

    isAuthor(id: string) {
        return this.#opts.hookAuthorPluginId === id;
    }

}

const createDefaultHooks = () => ({
    onGameDisposed: new Hook(HOOK_ON_GAME_DISPOSED, []),
    onGameReady: new Hook(HOOK_ON_GAME_READY, [], { async: true }),
    onScenePrepared: new Hook(HOOK_ON_SCENE_PREPARED, ["scene", "sceneUserData", "map", "replayHeader"]),
    onUnitCreated: new Hook(HOOK_ON_UNIT_CREATED, ["unit"]),
    onUnitKilled: new Hook(HOOK_ON_UNIT_KILLED, ["unit"]),
    onFrameReset: new Hook(HOOK_ON_FRAME_RESET, []),
    onUnitsFollowed: new Hook(HOOK_ON_UNITS_FOLLOWED, ["units"]),
    onUnitUnfollowed: new Hook(HOOK_ON_UNIT_UNFOLLOWED, ["unit"]),
    onUnitClearFollowed: new Hook(HOOK_ON_UNITS_CLEAR_FOLLOWED, []),
    onUnitsSelected: new Hook(HOOK_ON_UNITS_CLEAR_FOLLOWED, ["units"]),
    onUpgradeCompleted: new Hook(HOOK_ON_UPGRADE_COMPLETED, ["upgrade"]),
    onTechCompleted: new Hook(HOOK_ON_TECH_COMPLETED, ["tech"]),
});



const pluginProto: PluginPrototype = {
    id: "",
    $$permissions: {},
    $$config: {},

    setConfig(key: string, value: any, persist = true) {
        if (!(key in this.$$config)) {
            log.warning(`Plugin ${this.id} tried to set config key ${key} but it was not found`);
            return undefined;
        }

        // TODO: use leva detection algo here to determine if values are in bounds

        this.$$config[key].value = value;

        if (persist) {
            updatePluginsConfig(this.id, this.$$config);
        }
    }
};

function processConfigBeforeReceive(config: any) {
    if (config) {
        const configCopy: any = {};
        Object.keys(config).forEach((key) => {
            if (config[key]?.value !== undefined) {
                if (config[key]?.factor !== undefined) {
                    configCopy[key] = config[key].value * config[key].factor;
                } else {
                    configCopy[key] = config[key].value;
                }
            }
        });
        return Object.freeze(configCopy);
    }
}

const VALID_PERMISSIONS = [
    PERMISSION_REPLAY_COMMANDS,
    PERMISSION_REPLAY_FILE
];

export class PluginSystemNative {
    #nativePlugins: NativePlugin[] = [];
    #uiPlugins: PluginSystemUI;
    #janitor = new Janitor;

    readonly hooks: Record<string, Hook> = createDefaultHooks();

    initializePlugin(pluginPackage: InitializedPluginPackage) {

        try {
            if (!pluginPackage.nativeSource) {
                throw new Error("No native source provided");
            }

            const c = createCompartment();
            const pluginRaw = c.globalThis.Function(pluginPackage.nativeSource!)();

            //override but give a truthy value
            pluginPackage.nativeSource = "true";

            pluginRaw.id = pluginPackage.id;
            pluginRaw.name = pluginPackage.name;
            //FIXME: freeze config but allow us to edit for saving
            // possibly use a Weakmap instead of attaching to object
            pluginRaw.$$config = JSON.parse(JSON.stringify(pluginPackage.config));

            const permissions = (pluginPackage.config?.system?.permissions ?? []).reduce((acc: Record<string, boolean>, permission: string) => {
                if (VALID_PERMISSIONS.includes(permission)) {
                    acc[permission] = true;
                } else {
                    log.warning(`Invalid permission ${permission} for plugin ${pluginPackage.name}`);
                }
                return acc;
            }, {});
            pluginRaw.$$permissions = Object.freeze(permissions);

            const nonEditableKeys = ["id", "name", "$$permissions"];

            const pluginPropertyConfig: Record<string, {}> = {};
            for (const key in pluginRaw) {
                if (pluginRaw.hasOwnProperty(key)) {
                    const editable = nonEditableKeys.includes(key) ? false : true;
                    pluginPropertyConfig[key as keyof typeof pluginPropertyConfig] = {
                        configurable: editable,
                        enumerable: true,
                        writable: editable,
                        value: pluginRaw[key]
                    }
                }
            }

            const plugin = Object.create(pluginProto, pluginPropertyConfig);

            plugin.config = processConfigBeforeReceive(pluginPackage.config);
            plugin.sendUIMessage = throttle((message: any) => {
                this.#sendCustomUIMessage(plugin, message);
            }, 100, { leading: true, trailing: false });;
            plugin.registerCustomHook = (name: string, args: string[], async = false) => {
                this.#registerCustomHook(name, args, pluginPackage.id, async);
            };
            plugin.callCustomHook = (name: string, ...args: any[]) => {
                if (this.hooks[name].isAuthor(pluginPackage.id)) {
                    return this.callHook(name, ...args);
                }
            };
            log.verbose(`@plugin-system-native: initialized plugin "${plugin.name}"`);
            plugin.onPluginCreated && plugin.onPluginCreated();

            return plugin;
        } catch (e: unknown) {
            if (e instanceof Error) {
                log.error(`@plugin-system: failed to initialize "${pluginPackage.name}" - ${e.message}`);
            }
        }
    };

    constructor(pluginPackages: InitializedPluginPackage[], uiPlugins: PluginSystemUI) {
        this.#nativePlugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(p => this.initializePlugin(p)).filter(Boolean);

        this.#uiPlugins = uiPlugins;

        const _messageListener = (event: MessageEvent) => {
            if (event.data.type === SYSTEM_EVENT_CUSTOM_MESSAGE) {
                const { pluginId, message } = event.data.payload;
                this.#onUIMessage(pluginId, message);
            }
        };
        window.addEventListener("message", _messageListener);
        this.#janitor.add(() => { window.removeEventListener("message", _messageListener); });
    }

    getCameraControllers() {
        return this.#nativePlugins.filter(p => p.isCameraController) as CameraController[];
    }

    #getByName(name: string) {
        return this.#nativePlugins.find(p => p.name === name);
    }

    #getById(id: string) {
        return this.#nativePlugins.find(p => p.id === id);
    }

    #registerCustomHook(name: string, args: string[], hookAuthorPluginId: string, async: boolean = false) {
        if (this.hooks[name] !== undefined) {
            log.error(`@plugin-system: hook ${name} already registered`);
            return;
        }

        if (!name.startsWith("onCustom")) {
            log.error(`@plugin-system: hook ${name} must start with "onCustom"`);
            return;
        }

        this.hooks[name] = new Hook(name, args, { async, hookAuthorPluginId });
    }

    #sendCustomUIMessage(plugin: NativePlugin, message: any) {
        if (this.#nativePlugins.includes(plugin)) {
            this.#uiPlugins.sendMessage({
                type: SYSTEM_EVENT_CUSTOM_MESSAGE,
                payload: {
                    pluginId: plugin.id,
                    message
                }
            });
        }
    }

    #onUIMessage(pluginId: string, message: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onUIMessage && plugin.onUIMessage(message);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onUIMessage "${plugin.name}"`, e));
            }
        }
    }

    dispose() {
        for (const plugin of this.#nativePlugins) {
            try {
                plugin.onPluginDispose && plugin.onPluginDispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
        }
        this.#nativePlugins = [];
    }

    disablePlugin(pluginId: string) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                plugin.onPluginDispose && plugin.onPluginDispose();
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onDispose "${plugin.name}"`, e));
            }
            this.#nativePlugins = this.#nativePlugins.filter(p => p !== plugin);
        }
    }

    onConfigChanged(pluginId: string, config: any) {
        const plugin = this.#nativePlugins.find(p => p.id === pluginId);
        if (plugin) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.config = processConfigBeforeReceive(config);
                plugin.onConfigChanged && plugin.onConfigChanged(oldConfig);
            } catch (e) {
                log.error(withErrorMessage(`@plugin-system-native: onConfigChanged "${plugin.name}"`, e));
            }
        }
    }

    onBeforeRender(delta: number, elapsed: number, target: Vector3, position: Vector3) {
        for (const plugin of this.#nativePlugins) {
            plugin.onBeforeRender && plugin.onBeforeRender(delta, elapsed, target, position);
        }
    }

    onRender(delta: number, elapsed: number) {
        for (const plugin of this.#nativePlugins) {
            plugin.onRender && plugin.onRender(delta, elapsed);
        }
    }

    onFrame(frame: number, commands: any[]) {
        for (const plugin of this.#nativePlugins) {
            if (plugin.onFrame) {
                if (plugin.$$permissions[PERMISSION_REPLAY_COMMANDS]) {
                    plugin.onFrame(frame, commands);
                } else {
                    plugin.onFrame(frame)
                }
            }
        }
    }

    enableAdditionalPlugins(pluginPackages: InitializedPluginPackage[]) {
        const additionalPlugins = pluginPackages.filter(p => Boolean(p.nativeSource)).map(p => this.initializePlugin(p)).filter(Boolean);

        this.#nativePlugins = [...this.#nativePlugins, ...additionalPlugins];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi(object: {}) {
        Object.assign(pluginProto, object);
        const keys = Object.keys(object);

        return () => {
            keys.forEach(key => {
                delete pluginProto[key as keyof typeof pluginProto];
            })
        }
    }

    callHook(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined) {
                plugin.context = context;
                context = plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                delete plugin.context;
            }
        }
        return context;
    }

    async callHookAsync(hookName: string, ...args: any[]) {
        if (this.hooks[hookName] === undefined) {
            log.error(`@plugin-system-native: hook "${hookName}" does not exist`);
            return;
        }

        let context;
        for (const plugin of this.#nativePlugins) {
            if (!this.hooks[hookName].isAuthor(plugin.id) && plugin[hookName as keyof typeof plugin] !== undefined) {
                plugin.context = context;
                context = await plugin[hookName as keyof typeof plugin].apply(plugin, args) ?? context;
                delete plugin.context;
            }
        }
        return context;
    }

    setAllMacroDefaults(macro: Macro) {
        for (const plugin of this.#nativePlugins) {
            macro.setPluginsDefaults(plugin.name, plugin.config);
        }
    }

    setMacroDefaults(macro: Macro, pluginId: string, config: any) {
        const plugin = this.#getById(pluginId);
        if (!plugin) {
            log.error(`Plugin ${pluginId} not found`);
            return;
        }
        macro.setPluginsDefaults(plugin.name, config);
    }

    getAllMacroActions() {
        const actions: { pluginName: string, pluginAction: string }[] = [];
        for (const plugin of this.#nativePlugins) {
            for (const key of Object.keys(plugin)) {
                if (key.startsWith('onMacro') && typeof plugin[key as keyof typeof plugin] === 'function') {
                    actions.push({
                        pluginName: plugin.name,
                        pluginAction: key,
                    })
                }
            }
        }
        return actions;
    }

    doMacroAction(action: MacroActionPlugin) {
        const plugin = this.#getByName(action.pluginName!);
        if (!plugin) {
            log.error(`@macro-action: Plugin ${action.pluginName} not found`);
            return;
        }

        if (action.effect === MacroActionEffect.CallMethod) {
            const key = action.field[0];
            if (typeof plugin[key as keyof NativePlugin] === "function") {
                try {
                    plugin[key as keyof NativePlugin]();
                } catch (e) {
                    log.error(withErrorMessage(`@macro-action: ${action.pluginName} ${key}`, e));
                }
            }
        } else {
            const key = action.field[0];
            const field = plugin.$$config[key];
            if (field === undefined) {
                return;
            }
            plugin.setConfig(key, getMacroActionValue(action, field.value, field.step, field.min, field.max), false);
        }
    }

}