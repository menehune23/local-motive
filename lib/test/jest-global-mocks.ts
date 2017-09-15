class MockStorage {

  storage: any = {};

  getItem(key: string) {
    return key in this.storage ? this.storage[key] : null;
  }

  setItem(key: string, value: string) {
    this.storage[key] = `${value}`;
  }

  removeItem(key: string) {
    delete this.storage[key];
  }

  clear() {
    this.storage = {};
  }
}

Object.defineProperty(window, 'localStorage', {  value: new MockStorage() });
Object.defineProperty(window, 'sessionStorage', { value: new MockStorage() });
