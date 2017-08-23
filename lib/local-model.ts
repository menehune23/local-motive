export abstract class LocalModel {

  constructor(private path: string) { }

  /**
   * Generates a subpath, relative to this model's path.
   * @param path Path to place under this model's path.
   */
  subpath(path: string): string {
    return this.path + '/' + path;
  }

  /**
   * Stores a value in local or session storage.
   * @param key Storage key, relative to this model's path.
   * @param value Value to store.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  store(key: string, value: string, session: boolean = false) {
    this.getStorage(session)[this.subpath(key)] = value;
  }

  /**
   * Retrieves a value from local or session storage.
   * @param key Storage key, relative to this model's path.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  load(key: string, session: boolean = false): string {
    return this.getStorage(session)[this.subpath(key)];
  }

  private getStorage(session: boolean): any {
    return session ? sessionStorage : localStorage;
  }
}
