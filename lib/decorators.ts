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
 * class to extend `LocalModel`.
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
    setFieldConfig(target, name, new FieldConfig(false, key, defaultValue, cache, serialize, deserialize));
  }
}

/**
 * Stores this field in session storage. Requires the containing
 * class to extend `LocalModel`.
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
    setFieldConfig(target, name, new FieldConfig(true, key, defaultValue, cache, serialize, deserialize));
  }
}

function setFieldConfig(target: any, field: string, config: FieldConfig) {
  const t = target.constructor.name;

  if (!fieldConfigs[t]) {
    fieldConfigs[t] = {};
  }

  fieldConfigs[t][field] = config;
}

export abstract class LocalModel {

  constructor(private path: string) {
    const t = (<any>this.constructor).name;

    if (fieldConfigs.hasOwnProperty(t)) {
      for (let field in fieldConfigs[t]) {
        addProperty(this, field, fieldConfigs[t][field]);
      }
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
  let cached: any;
  const key = config.key || name;
  const serialize = config.serialize || ((val) => {
    return JSON.stringify({ val: val });
  });

  const deserialize = config.deserialize || ((str) => {
    return JSON.parse(str).val;
  });

  Object.defineProperty(target, name, {
    get: () => {
      if (config.cache && cached != null) {
        return cached;
      }

      const str = target.load(key, config.session);
      const val = (str != null) ? deserialize(str) : config.defaultValue;

      if (config.cache) {
        cached = val;
      }

      return val;
    },
    set: (val) => {
      target.store(key, serialize(val), config.session);

      if (config.cache) {
        cached = val;
      }
    },
    enumerable: true,
    configurable: true
  });
}
