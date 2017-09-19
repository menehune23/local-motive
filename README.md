# local-motive
A small but powerful TypeScript/ES5 library that simplifies the use of HTML5 Web Storage APIs in your models

![logo](graphics/local-motive.png)

[![npm version](https://badge.fury.io/js/local-motive.svg)](https://badge.fury.io/js/local-motive)
[![build status](https://travis-ci.org/menehune23/local-motive.svg)](https://travis-ci.org/menehune23/local-motive)

## Installation

To install Local Motive, run:

```bash
$ npm install local-motive --save
```

## Usage

Local Motive provides `@LocalStorage` and `@SessionStorage` decorators that handle storage of model and nested model changes. To use them, just extend the provided [`LocalModel`](#localmodel) abstract class.

`LocalModel` requires a `storagePath` field, which is used to support storing changes to fields and nested models. It should be provided in the constructor of your derived model class. In addition, `LocalModel` provides a `subpath()` method for use in generating storage paths for nested models. See the example below.

_person.model.ts_
```typescript
import { LocalModel, LocalStorage, SessionStorage } from 'local-motive';
import { Phone } from './phone.model';

export class Person extends LocalModel {

  @LocalStorage()
  fullName: string;

  @SessionStorage()
  authKey: string;

  // Differing paths here avoid conflicting storage keys for
  // `primaryPhone.number` and `secondaryPhone.number`
  primaryPhone = new Phone(this.subpath('phone1'));
  secondaryPhone = new Phone(this.subpath('phone2'));
}
```

_phone.model.ts_
```typescript
import { LocalModel, LocalStorage, SessionStorage } from 'local-motive';

export class Phone extends LocalModel {

  @LocalStorage()
  number: string;
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

### Other Features

#### Decorators

The `@LocalStorage` and `@SessionStorage` decorators have many more features, like:

- Support for non-string types like number, object, array, and null
- Custom storage key
- Default value
- Custom serialization and deserialization
- Support for inherited properties

For more info, see the [decorators source](https://github.com/menehune23/local-motive/blob/master/lib/decorators.ts).
For additional usage examples, see the [test spec](https://github.com/menehune23/local-motive/blob/master/lib/test/tests.spec.ts).

#### LocalModel

`LocalModel` provides the following interface and can even be used without decorators, if desired:

```typescript
abstract class LocalModel {

  constructor(private storagePath: string);

  /**
   * Generates a storage subpath, relative to this model's path.
   * @param path Path to place under this model's path.
   * @param index Optional index value for generating an indexed path.
   */
  subpath(path: string, index?: number): string;

  /**
   * Stores a value in local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param value Value to store.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  store(key: string, value: string, session: boolean = false);

  /**
   * Retrieves a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to store in session storage.
   * Defaults to false.
   */
  load(key: string, session: boolean = false): string;

  /**
   * Deletes a value from local or session storage.
   * @param key Storage key, relative to this model's storage path.
   * @param session Whether or not to delete from session storage.
   * Defaults to false.
   */
  delete(key: string, session: boolean = false);

  /**
   * Deletes all stored values for this model and any submodels.
   */
  deleteAll();
```

For usage examples, see the [test spec](https://github.com/menehune23/local-motive/blob/master/lib/test/tests.spec.ts).

## A Word of Caution with Initialized Fields

While fields that have initial values can be decorated with the `@LocalStorage` or `@SessionStorage` decorators, the outcome will likely not be the desired one. This is because an initial value will overwrite any value in storage for a given decorated field. To provide an initial value for a decorated field that will only apply if no value is currently stored, use the `defaultValue` parameter in your decorator. See the [decorators source](https://github.com/menehune23/local-motive/blob/master/lib/decorators.ts) for more info.

## License

MIT © [Andrew Meyer](https://coeurdecode.com/contact)
