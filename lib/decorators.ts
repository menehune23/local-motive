import { LocalModel } from './local-model';

class FieldConfig {
  constructor(
    public session: boolean,
    public key?: string,
    public defaultTo?: any,
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
 * @param defaultTo Optional default value to return on retrieval
 * if no value stored.
 * @param cache Whether or not to cache a copy this field's value
 * to increase performance. Defaults to true.
 * @param serialize Optional serializer function.
 * @param deserialize Optional deserializer function.
 */
export function LocalStorage(
  key?: string,
  defaultTo?: any,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(false, key, defaultTo, cache, serialize, deserialize);
  }
}

/**
 * Stores this field in session storage. Requires the containing
 * class to be a `LocalModel` decorated with `@Local`.
 * @param key Storage key, relative to this model's storage path.
 * Defaults to field name.
 * @param defaultTo Optional default value to return on retrieval
 * if no value stored.
 * @param cache Whether or not to cache a copy this field's value
 * to increase performance. Defaults to true.
 * @param serialize Optional serializer function.
 * @param deserialize Optional deserializer function.
 */
export function SessionStorage(
  key?: string,
  defaultTo?: any,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(true, key, defaultTo, cache, serialize, deserialize);
  }
}

/**
 * Allows this class to support local and session storage
 * via the `@LocalStorage` and `@SessionStorage` decorators.
 */
export function Local(constructor: Function) {
  const newConstructor = function(this: LocalModel, ...args: any[]) {
    constructor.apply(this, args);

    for (let field in fieldConfigs) {
      addProperty(this, field, fieldConfigs[field]);
    }
  }

  newConstructor.prototype = constructor.prototype;

  return newConstructor;
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
      const val = (str != null) ? deserialize(str) : config.defaultTo;

      if (config.cache) {
        valueContainer.val = val;
      }

      return val;
    },
    set: (val) => {
      if (valueContainer.val !== val) {
        valueContainer.val = val;
        target.store(key, serialize(val), config.session);
      }
    },
    enumerable: true,
    configurable: true
  });
}
