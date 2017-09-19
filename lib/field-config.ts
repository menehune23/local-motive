import 'reflect-metadata';

export class FieldConfig {
  constructor(
    public session: boolean,
    public key?: string,
    public defaultValue?: any,
    public cache?: boolean,
    public serialize?: (_: any) => string,
    public deserialize?: (_: string) => any
  ) { }
}

const FIELD_CONFIGS_KEY = 'local_motive:field_configs';

export function setFieldConfig(target: any, field: string, config: FieldConfig) {
  const configs = getAllFieldConfigs(target);
  configs[field] = config;
  setAllFieldConfigs(target, configs);
}

export function getAllFieldConfigs(target: any): any {
  return Reflect.getMetadata(FIELD_CONFIGS_KEY, target) || {};
}

export function setAllFieldConfigs(target: any, configs: any) {
  Reflect.defineMetadata(FIELD_CONFIGS_KEY, configs, target);
}
