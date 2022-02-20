import { app } from "electron";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";

import phrases from "../../common/phrases";
import { defaultSettings } from "../../common/settings";
import fileExists from "../../common/utils/file-exists";
import { Settings as SettingsType, InitializedPluginJSON, AvailableLifecycles, PluginJSON, ScreenType, ScreenStatus, WorkerPluginConfig, InitializedWorkerPluginConfig, InitializedIFramePluginConfig } from "../../common/types";
import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";
import { SettingsMeta } from "src/renderer/stores";
import migrate from "./migrate";
import readFolder from "../starcraft/get-files";
import path from "path";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
const screenDataMap = {
  "@replay/loading": {
    screenType: ScreenType.Replay,
    screenStatus: ScreenStatus.Loading,
  }, "@replay/ready": {
    screenType: ScreenType.Replay,
    screenStatus: ScreenStatus.Ready,

  }, "@map/loading": {
    screenType: ScreenType.Map,
    screenStatus: ScreenStatus.Loading,

  }, "@map/ready": {
    screenType: ScreenType.Map,
    screenStatus: ScreenStatus.Ready,
  }
} as Record<AvailableLifecycles, { screenType: ScreenType, screenStatus: ScreenStatus }>;

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};

let _pluginConfigs: InitializedPluginJSON[];
/**
 * A settings management utility which saves and loads settings from a file.
 * It will also emit a "change" event whenever the settings are loaded or saved.
 */
export class Settings extends EventEmitter {
  private _settings: SettingsType = {
    ...defaultSettings
  };
  private _filepath = "";

  /**
   * Loads the existing settings file from disk.
   * It will migrate the settings if they are not compatible with the current version.
   * It will create a new settings file if it does not exist.
   * @param filepath 
   */
  async init(filepath: string) {
    this._filepath = filepath;

    if (await fileExists(filepath)) {
      await this.loadAndMigrate();
    } else {
      await this.save(await this.createDefaults());
    }

    this.loadPluginsConfiguration();
  }

  get() {
    return this._settings;
  }

  async loadPluginsConfiguration() {
    if (_pluginConfigs) return;
    _pluginConfigs = [];

    const folders = await readFolder(path.join(__static, "plugins"));
    for (const folder of folders) {
      if (folder.isFolder) {
        const filePath = path.join(folder.path, "plugin.json");
        if (await fileExists(filePath)) {
          const contents = await fsPromises.readFile(filePath, { encoding: "utf8" });
          const pluginConfig = JSON.parse(contents) as PluginJSON;
          //TODO: improve types cause this is bs
          const pluginOut = pluginConfig as unknown as InitializedPluginJSON;

          const importfilePath = path.join(folder.path, "native.js");
          if (await fileExists(importfilePath)) {
            pluginOut.native = await fsPromises.readFile(importfilePath, { encoding: "utf8" });;
          }

          const channels: (InitializedWorkerPluginConfig | InitializedIFramePluginConfig)[] = [];

          for (const channelKey in pluginConfig.channels) {
            const channelsConfig = pluginConfig.channels[channelKey as AvailableLifecycles];
            for (const channel of channelsConfig) {
              const url = channel.url ?? channel.type === "worker" ? pluginConfig["worker.url"] : pluginConfig["iframe.url"];
              if (url) {
                channel.url = url.startsWith("http") ? url : `http://localhost:${this._settings.pluginServerPort}/${folder.name}/${url}`
              }

              channels.push({
                ...channel,
                ...screenDataMap[channelKey as AvailableLifecycles]
              });
            }
          }

          pluginOut.channels = channels;
          _pluginConfigs.push(pluginOut);
        }
      }

    }
  }
  /**
   * 
   * @returns a JS object with the current settings and metadata
   */
  async getMeta(): Promise<SettingsMeta> {
    //FIXME: use Error objects so we can contain and id as well as message
    const errors = [];
    const files = [
      "starcraft",
      "maps",
      "replays",
      "models",
      "temp",
    ];

    for (const file of files) {
      if (!(await fileExists(this._settings.directories[file as keyof SettingsType["directories"]]))) {
        errors.push(`${file} directory is not a valid path`);
      }
    }

    const isCascStorage = await foldersExist(this._settings.directories["starcraft"], ["Data", "locales"]);
    if (!isCascStorage && !await foldersExist(this._settings.directories["starcraft"], ["anim", "arr"])) {
      errors.push("starcraft directory is not a valid path");
    }

    const localLanguage = supportedLanguages.includes(getEnvLocale() as string)
      ? (getEnvLocale() as string)
      : "en-US";
    this._settings.language = supportedLanguages.includes(
      this._settings.language
    )
      ? this._settings.language
      : localLanguage;

    return {
      data: { ...(await this.createDefaults()), ...this._settings },
      errors,
      isCascStorage,
      pluginConfigs: _pluginConfigs,
      phrases: {
        ...phrases["en-US"],
        ...phrases[this._settings.language as keyof typeof phrases],
      },
    };
  }

  /**
   * Loads the settings.yml file from disk and parses the contents into a JS object.
   * Emits the "change" event.
   */
  async load(): Promise<SettingsType> {
    const contents = await fsPromises.readFile(this._filepath, {
      encoding: "utf8",
    });
    return JSON.parse(contents) as SettingsType;
  }

  async loadAndMigrate() {
    const settings = await this.load();
    const [migrated, migratedSettings] = migrate(settings);
    if (migrated) {
      await this.save(migratedSettings);
      this._settings = migratedSettings;
    } else {
      this._settings = settings;
    }
    this._emitChanged();
  }

  /**
   * Saves the settings to disk. Will ignore any existing errors.
   * Emits the "change" event.
   * @param settings 
   */
  async save(settings: any) {
    if (settings.errors) {
      delete settings.errors;
    }

    this._settings = Object.assign({}, this._settings, settings);
    await fsPromises.writeFile(this._filepath, JSON.stringify(this._settings, null, 4), {
      encoding: "utf8",
    });
    this._emitChanged();
  }

  async _emitChanged() {
    this.emit("change", await this.getMeta());
  }

  /**
   * Creates default settings for the user.
   * @returns a JS object with default settings
   */
  async createDefaults(): Promise<SettingsType> {
    return {
      ...defaultSettings,
      language: supportedLanguages.find(s => s === String(getEnvLocale()))
        ??
        "en-US",
      directories: {
        starcraft: await findStarcraftPath(),
        maps: await findMapsPath(),
        replays: await findReplaysPath(),
        temp: app.getPath("temp"),
        models: app.getPath("documents")
      }
    };
  }
}
