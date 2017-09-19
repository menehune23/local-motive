import { FieldConfig, setFieldConfig, getAllFieldConfigs, setAllFieldConfigs } from './field-config';

export abstract class LocalModel {

  constructor(private storagePath: string) {
    const configs = getAllFieldConfigs(this.constructor.prototype);

    for (const field in configs) {
      const config = configs[field];

      if (config) {
        this.addProperty(field, config);
      }
    }
  }

  /**
   * Generates a storage subpath, relative to this model's path.
   * @param path Path to place under this model's path.
   * @param index Optional index value for generating an indexed path.
   */
  subpath(path: string, index?: number): string {
    return `${this.storagePath}/${path}${(index != null) ? `/${index}` : ''}`;
  }

  /**
   * Stores a value in local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param value Value to store.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  store(key: string, value: string, session: boolean = false) {
    this.getStorage(session).setItem(this.subpath(key), value);
  }

  /**
   * Retrieves a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  load(key: string, session: boolean = false): string {
    return this.getStorage(session).getItem(this.subpath(key));
  }

  /**
   * Deletes a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to delete from session storage.
   * Defaults to false.
   */
  delete(key: string, session: boolean = false) {
    this.getStorage(session).removeItem(this.subpath(key));
  }

  /**
   * Removes all values from both local and session storage for
   * this model and any submodels.
   */
  clear() {
    this.removeAllStored(localStorage);
    this.removeAllStored(sessionStorage);
  }

  private getStorage(session: boolean): any {
    return session ? sessionStorage : localStorage;
  }

  private removeAllStored(storage: Storage) {
    const length = storage.length;
    const remove = [];

    for (let i = 0; i < length; i++) {
      const key = storage.key(i);

      if (key != null && key.lastIndexOf(this.storagePath + '/', 0) === 0) {
        remove.push(key);
      }
    }

    for (const key of remove) {
      storage.removeItem(key);
    }
  }

  private addProperty(name: string, config: FieldConfig) {
    let cached: any;
    const key = config.key || name;

    const serialize = config.serialize || ((val) => {
      return JSON.stringify({ val: val });
    });

    const deserialize = config.deserialize || ((str) => {
      return JSON.parse(str).val;
    });

    Object.defineProperty(this, name, {
      get: () => {
        if (config.cache && cached != null) {
          return cached;
        }

        const str = this.load(key, config.session);
        const val = (str != null) ? deserialize(str) : config.defaultValue;

        if (config.cache) {
          cached = val;
        }

        return val;
      },
      set: (val) => {
        this.store(key, serialize(val), config.session);

        if (config.cache) {
          cached = val;
        }
      },
      enumerable: true,
      configurable: true
    });
  }
}

