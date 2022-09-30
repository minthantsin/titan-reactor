
import lGet from "lodash.get";
import lSet from "lodash.set";
import { DeepPartial } from "common/types";
import deepMerge from "deepmerge";
import { arrayOverwriteMerge } from "@utils/object-utils";

type Args<T extends Record<string, any>> = {
    initialState: T;
    validateMerge?: (newStore: T, rhs: DeepPartial<T>, path?: string[], value?: any) => boolean;
    onUpdate?: (newStore: T, rhs: DeepPartial<T>, path?: string[], value?: any) => void;
}

/**
 * 
 * Creates a store that can be reset to a previous state.
 * 
 * @param options
 * @returns 
 */
//TODO: refactor this to be called DeepStore and extract the sourceOfTruth stuff
export function createDeepStore<T extends Record<string, any>>({ initialState, validateMerge: validateMerge, onUpdate }: Args<T>): DeepStore<T> {

    const store = initialState;

    const merge = (rhs: DeepPartial<T>, path?: string[], value?: any) => {

        const result = deepMerge(store, rhs, { arrayMerge: arrayOverwriteMerge }) as Required<T>;

        if (validateMerge === undefined || validateMerge(result, rhs, path, value)) {
            Object.assign(store, result);
            onUpdate && onUpdate(store, rhs, path, value);
        }

    }

    const getValue = (path: string[]) => lGet(store, path);

    const setValue = (path: string[], value: any) => {
        merge(lSet<DeepPartial<T>>({}, path, value), path, value);
    }

    return {
        getState: () => store,
        getValue,
        setValue,
        merge,
    }
}

export type DeepStore<T extends object> = {
    getState: () => T;
    setValue: (path: string[], value: any) => void;
    getValue: (path: string[]) => any;
    merge: (rhs: DeepPartial<T>) => void;
}