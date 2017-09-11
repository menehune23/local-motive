import { LocalModel } from './local-model';

class FieldConfig {
  constructor(
    public session: boolean,
    public key?: string,
    public cache: boolean = true,
    public serialize?: (_: any) => string,
    public deserialize?: (_: string) => any
  ) { }
}

const fieldConfigs: any = {};

export function LocalStorage(
  key?: string,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(false, key, cache, serialize, deserialize);
  }
}

export function SessionStorage(
  key?: string,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return (target: any, name: string) => {
    fieldConfigs[name] = new FieldConfig(true, key, cache, serialize, deserialize);
  }
}

export function Local(constructor: Function) {
  const newConstructor = function(...args: any[]) {
    for (let field in fieldConfigs) {
      addProperty(this, field, fieldConfigs[field]);
    }

    constructor.apply(this, args);
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
      if (config.cache && valueContainer.val) {
        return valueContainer.val;
      }

      const val = deserialize(target.load(key, config.session));

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
