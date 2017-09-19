import { FieldConfig, setFieldConfig, getAllFieldConfigs, setAllFieldConfigs } from './field-config';
import 'reflect-metadata';

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
