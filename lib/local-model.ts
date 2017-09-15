export abstract class LocalModel {

  constructor(private path: string) {}

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
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  delete(key: string, session: boolean = false) {
    this.getStorage(session).removeItem(this.subpath(key));
  }

  private getStorage(session: boolean): any {
    return session ? sessionStorage : localStorage;
  }
}
