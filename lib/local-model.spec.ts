import { LocalModel } from './local-model';
import './jest-global-mocks';

class ModelA extends LocalModel {

  get fieldA1(): string {
    return this.load('fieldA1');
  }

  set fieldA1(value: string) {
    this.store('fieldA1', value);
  }

  fieldA2 = new ModelB(this.subpath('fieldA2'));
  fieldA3 = new ModelB(this.subpath('fieldA3'));

  get fieldA4(): string {
    return this.load('fieldA4', true);
  }

  set fieldA4(value: string) {
    this.store('fieldA4', value, true);
  }
}

class ModelB extends LocalModel {
  get fieldB1(): string {
    return this.load('fieldB1');
  }

  set fieldB1(value: string) {
    this.store('fieldB1', value);
  }
}

describe('LocalModel', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should store fields in correct locations', () => {
    const model = new ModelA('model');

    model.fieldA1 = 'a';
    model.fieldA2.fieldB1 = 'b';
    model.fieldA3.fieldB1 = 'c';
    model.fieldA4 = 'd';

    expect(localStorage['model/fieldA1']).toEqual('a');
    expect(localStorage['model/fieldA2/fieldB1']).toEqual('b');
    expect(localStorage['model/fieldA3/fieldB1']).toEqual('c');
    expect(sessionStorage['model/fieldA4']).toEqual('d');
  });

  it('should load fields from correct locations', () => {
    localStorage['model/fieldA1'] = 'a';
    localStorage['model/fieldA2/fieldB1'] = 'b';
    localStorage['model/fieldA3/fieldB1'] = 'c';
    sessionStorage['model/fieldA4'] = 'd';

    const model = new ModelA('model');

    expect(model.fieldA1).toEqual('a');
    expect(model.fieldA2.fieldB1).toEqual('b');
    expect(model.fieldA3.fieldB1).toEqual('c');
    expect(model.fieldA4).toEqual('d');
  });
});
