# local-motive
A small TypeScript/ES5 library that simplifies the use of HTML5 Web Storage APIs with your models

![logo](graphics/local-motive.png)

[![npm version](https://badge.fury.io/js/local-motive.svg)](https://badge.fury.io/js/local-motive)
[![build status](https://travis-ci.org/menehune23/local-motive.svg)](https://travis-ci.org/menehune23/local-motive)

## Installation

To install Local Motive, run:

```bash
$ npm install local-motive --save
```

## Usage

Local Motive provides [`LocalModel`](https://github.com/menehune23/local-motive/blob/master/lib/local-model.ts), an abstract class with the following interface:

```typescript
abstract class LocalModel {
  constructor(path: string);

  /**
   * Generates a storage subpath, relative to this model's path.
   * @param path Path to place under this model's path.
   * @param index Optional index value for generating an indexed path.
   */
  subpath(path: string): string;

  /**
   * Stores a value in local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param value Value to store.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  store(key: string, value: string, session: boolean = false): void;

  /**
   * Retrieves a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  load(key: string, session?: boolean): string;

  /**
   * Deletes a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  delete(key: string, session: boolean = false) {
    this.getStorage(session).removeItem(key);
  }
}
```

To use the class, simply extend it as follows (or use [decorators](#decorators)):

_person.model.ts_
```typescript
import { LocalModel } from 'local-motive';
import { Phone } from './phone.model';

export class Person extends LocalModel {

  // Full name stored in local storage

  get fullName(): string {
    return this.load('fullName');
  }

  set fullName(value: string) {
    this.store('fullName', value);
  }

  // Auth key stored in session storage

  get authKey(): string {
    return this.load('authKey', true);
  }

  set authKey(value: string) {
    this.store('authKey', value, true);
  }

  // Differing paths here avoid conflicting storage keys for
  // `primaryPhone.number` and `secondaryPhone.number`
  primaryPhone = new Phone(this.subpath('primaryPhone'));
  secondaryPhone = new Phone(this.subpath('secondaryPhone'));
}
```

_phone.model.ts_
```typescript
import { LocalModel } from 'local-motive';

export class Phone extends LocalModel {

  get number(): string {
    return this.load('number');
  }

  set number(value: string) {
    this.store('number', value);
  }
}
```

Now, when you modify values on your models, including nested models, the data will be persisted automatically.

This is especially useful if you're using a framework like [Angular](https://angular.io), where you can bind directly to locally-stored models in your views:

_demo.component.ts_
```typescript
import { Component } from '@angular/core';
import { Person } from './person.model';

@Component({
  selector: 'app-demo',
  template: `
    <h3>Person 1</h3>
    <input placeholder="Full Name" [(ngModel)]="person1.fullName">
    <input placeholder="Auth Key" [(ngModel)]="person1.authKey">
    <input placeholder="Primary Phone" [(ngModel)]="person1.primaryPhone.number">
    <input placeholder="Secondary Phone" [(ngModel)]="person1.secondaryPhone.number">

    <h3>Person 2</h3>
    <input placeholder="Full Name" [(ngModel)]="person2.fullName">
    <input placeholder="Auth Key" [(ngModel)]="person2.authKey">
    <input placeholder="Primary Phone" [(ngModel)]="person2.primaryPhone.number">
    <input placeholder="Secondary Phone" [(ngModel)]="person2.secondaryPhone.number">
  `
})
export class DemoComponent {

  // Paths provided must be unique across app to avoid
  // storage key conflicts (and thus overwritten data)
  person1 = new Person('person1');
  person2 = new Person('person2');
}
```

### Decorators

Local Motive also provides a decorator-based approach, which is often more convenient. Using decorators, the `Person` and `Phone` models above would become:

_person.model.ts_
```typescript
import { LocalModel, Local, LocalStorage, SessionStorage } from 'local-motive';
import { Phone } from './phone.model';

@Local
export class Person extends LocalModel {

  @LocalStorage()
  fullName: string;

  @SessionStorage()
  authKey: string;

  // Differing paths here avoid conflicting storage keys for
  // `primaryPhone.number` and `secondaryPhone.number`
  primaryPhone = new Phone(this.subpath('primaryPhone'));
  secondaryPhone = new Phone(this.subpath('secondaryPhone'));
}
```

_phone.model.ts_
```typescript
import { LocalModel, Local, LocalStorage, SessionStorage } from 'local-motive';

@Local
export class Phone extends LocalModel {

  @LocalStorage()
  number: string;
}
```

The `@LocalStorage` and `@SessionStorage` decorators support many more features, like:

- Support for non-string types like numbers, objects, and arrays
- Custom storage key
- Default value
- Custom serialization and deserialization

For more info, see the [decorators source](https://github.com/menehune23/local-motive/blob/master/lib/decorators.ts).
For additional usage examples, see the [test spec](https://github.com/menehune23/local-motive/blob/master/lib/test/decorators.spec.ts).

## License

MIT © [Andrew Meyer](https://coeurdecode.com/contact)
