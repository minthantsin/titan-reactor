import { app } from "electron";
import { EventEmitter } from "events";
import { promises as fsPromises } from "fs";
import path from "path";
import yaml from "js-yaml"
import { AnyObject, toCamel, toSnake } from "../../common/utils/camel"

import phrases from "../../common/phrases";
import { defaultSettings } from "../../common/settings";
import fileExists from "../../common/utils/file-exists";
import { Settings as SettingsType } from "../../common/types";
import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import foldersExist from "./folders-exist";
import { SettingsMeta } from "src/renderer/stores";
import migrate from "./migrate";

const supportedLanguages = ["en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU"];
export const findTempPath = () => app.getPath("temp");

const getEnvLocale = (env = process.env) => {
  return env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
};

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
  }

  /**
   * 
   * @returns a JS object with the current settings and metadata
   */
  async get(): Promise<SettingsMeta> {
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
  async load() {
    const contents = await fsPromises.readFile(this._filepath, {
      encoding: "utf8",
    });
    return toCamel(yaml.load(contents) as any);
  }

  async loadAndMigrate() {
    const settings = await this.load();
    const [migrated, migratedSettings] = migrate(settings);
    if (migrated) {
      await this.save(migratedSettings);
      this._settings = migratedSettings;
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
    await fsPromises.writeFile(this._filepath, yaml.dump(this._settings), {
      encoding: "utf8",
    });
    this._emitChanged();
  }

  async _emitChanged() {
    this.emit("change", await this.get());
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
        temp: await findTempPath(),
        models: app.getPath("documents")
      }
    };
  }
}
