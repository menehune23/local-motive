class FieldConfig {
  constructor(
    public session: boolean,
    public key?: string,
    public defaultValue?: any,
    public cache?: boolean,
    public serialize?: (_: any) => string,
    public deserialize?: (_: string) => any
  ) { }
}

const fieldConfigs: any = {};

/**
 * Stores this field in local storage. Requires the containing
 * class to be a `LocalModel` decorated with `@Local`.
 * @param key Storage key, relative to this model's storage path.
 * Defaults to field name.
 * @param defaultValue Optional default value to return on retrieval
 * if no value stored.
 * @param cache Whether or not to cache a copy this field's value
 * to increase performance. Defaults to true.
 * @param serialize Optional serializer function.
 * @param deserialize Optional deserializer function.
 */
export function LocalStorage(
  key?: string,
  defaultValue?: any,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(false, key, defaultValue, cache, serialize, deserialize);
  }
}

/**
 * Stores this field in session storage. Requires the containing
 * class to be a `LocalModel` decorated with `@Local`.
 * @param key Storage key, relative to this model's storage path.
 * Defaults to field name.
 * @param defaultValue Optional default value to return on retrieval
 * if no value stored.
 * @param cache Whether or not to cache a copy this field's value
 * to increase performance. Defaults to true.
 * @param serialize Optional serializer function.
 * @param deserialize Optional deserializer function.
 */
export function SessionStorage(
  key?: string,
  defaultValue?: any,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(true, key, defaultValue, cache, serialize, deserialize);
  }
}

export abstract class LocalModel {

    constructor(private path: string) {
      for (let field in fieldConfigs) {
        addProperty(this, field, fieldConfigs[field]);
      }
    }

    /**
     * Generates a storage subpath, relative to this model's path.
     * @param path Path to place under this model's path.
     * @param index Optional index value for generating an indexed path.
     */
    subpath(path: string, index?: number): string {
      return `${this.path}/${path}${(index != null) ? `/${index}` : ''}`;
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

    private getStorage(session: boolean): any {
      return session ? sessionStorage : localStorage;
    }
  }

function addProperty(target: LocalModel, name: string, config: FieldConfig) {
  const valueContainer: any = {};
  const key = config.key || name;
  const serialize = config.serialize || ((_) => {
    return JSON.stringify(valueContainer);
  });

  const deserialize = config.deserialize || ((str) => {
    return JSON.parse(str).val;
  });

  Object.defineProperty(target, name, {
    get: () => {
      if (config.cache && valueContainer.val != null) {
        return valueContainer.val;
      }

      const str = target.load(key, config.session);
      const val = (str != null) ? deserialize(str) : config.defaultValue;

      if (config.cache) {
        valueContainer.val = val;
      }

      return val;
    },
    set: (val) => {
      if (valueContainer.val !== val || val == null) {
        valueContainer.val = val;
        target.store(key, serialize(val), config.session);
      }
    },
    enumerable: true,
    configurable: true
  });
}
