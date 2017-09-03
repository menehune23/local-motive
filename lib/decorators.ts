export function LocalStorage(
  key?: string,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return storageDecorator(localStorage, key, cache, serialize, deserialize);
}

export function SessionStorage(
  key?: string,
  cache: boolean = true,  
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any
) {
  return storageDecorator(sessionStorage, key, cache, serialize, deserialize);
}

function storageDecorator(
  storage: Storage,
  key?: string,
  cache: boolean = true,
  serialize?: (_: any) => string,
  deserialize?: (_: string) => any,
) {
  return (target: any, name: string) => {
    const valueWrapper: any = {};

    key = key || name;  // TODO: prefix with subpath

    serialize = serialize || ((x) => {
      return JSON.stringify(valueWrapper);
    });

    deserialize = deserialize || ((x) => {
      valueWrapper.v = JSON.parse(x).v;
      return valueWrapper.v;
    });

    Object.defineProperty(target, name, {
      get: () => {
        if (valueWrapper.v && cache) {
          return valueWrapper.v;
        }

        return deserialize(storage[key]);
      },
      set: (val) => {
        valueWrapper.v = val;
        storage[key] = serialize(val);
      },
      enumerable: true,
      configurable: true
    });
  }
}
