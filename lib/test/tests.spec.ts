import {} from 'jasmine';
import './jest-global-mocks';
import { LocalModel } from '../local-model';
import { Local, LocalStorage, SessionStorage } from '../decorators';

describe('Local Motive', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('basic operations', () => {

    @Local
    class Model extends LocalModel {

      @LocalStorage()
      stringField: string;

      @LocalStorage()
      implicitlyUndefinedField: any;

      @LocalStorage()
      explicitlyUndefinedField: any;

      @LocalStorage()
      nullField: any;

      @LocalStorage()
      numberField: number;

      @LocalStorage()
      anyField: any;

      @LocalStorage()
      arrayField: number[];

      @SessionStorage()
      tempField: string;

      subModel: SubModel = new SubModel(this.subpath('A'));

      arrayOfSubModels = [
        new SubModel(this.subpath('B', 0)),
        new SubModel(this.subpath('B', 1))
      ];
    }

    @Local
    class SubModel extends LocalModel {
      @LocalStorage()
      someField: string;
    }

    it('should store correct values', () => {

      const model = new Model('model');

      model.stringField = 'foo';
      model.explicitlyUndefinedField = undefined;
      model.nullField = null;
      model.numberField = 42.314;
      model.anyField = { foo: 'bar' };
      model.arrayField = [1, 2, 3];
      model.tempField = 'temp';
      model.subModel.someField = 'a';
      model.arrayOfSubModels[0].someField = 'b0';
      model.arrayOfSubModels[1].someField = 'b1';

      expect(localStorage.getItem('model/stringField')).toEqual('{"val":"foo"}');
      expect(localStorage.getItem('model/implicitlyUndefinedField')).toBeNull();
      expect(localStorage.getItem('model/explicitlyUndefinedField')).toEqual('{}');
      expect(localStorage.getItem('model/nullField')).toEqual('{"val":null}');
      expect(localStorage.getItem('model/numberField')).toEqual('{"val":42.314}');
      expect(localStorage.getItem('model/anyField')).toEqual('{"val":{"foo":"bar"}}');
      expect(localStorage.getItem('model/arrayField')).toEqual('{"val":[1,2,3]}');
      expect(sessionStorage.getItem('model/tempField')).toEqual('{"val":"temp"}');
      expect(localStorage.getItem('model/A/someField')).toEqual('{"val":"a"}');
      expect(localStorage.getItem('model/B/0/someField')).toEqual('{"val":"b0"}');
      expect(localStorage.getItem('model/B/1/someField')).toEqual('{"val":"b1"}');
    });

    it('should load correct values', () => {

      localStorage.setItem('model/stringField', '{"val":"foo"}');
      localStorage.setItem('model/explicitlyUndefinedField', '{}');
      localStorage.setItem('model/nullField', '{"val":null}');
      localStorage.setItem('model/numberField', '{"val":42.314}');
      localStorage.setItem('model/anyField', '{"val":{"foo":"bar"}}');
      localStorage.setItem('model/arrayField', '{"val":[1,2,3]}');
      sessionStorage.setItem('model/tempField', '{"val":"temp"}');
      localStorage.setItem('model/A/someField', '{"val":"a"}');
      localStorage.setItem('model/B/0/someField', '{"val":"b0"}');
      localStorage.setItem('model/B/1/someField', '{"val":"b1"}');

      const model = new Model('model');

      expect(model.stringField).toEqual('foo');
      expect(model.implicitlyUndefinedField).toBeUndefined();
      expect(model.explicitlyUndefinedField).toBeUndefined();
      expect(model.nullField).toBeNull();
      expect(model.numberField).toEqual(42.314);
      expect(model.anyField).toEqual({ foo: 'bar' });
      expect(model.arrayField).toEqual([1, 2, 3]);
      expect(model.tempField).toEqual('temp');
      expect(model.subModel.someField).toEqual('a');
      expect(model.arrayOfSubModels[0].someField).toEqual('b0');
      expect(model.arrayOfSubModels[1].someField).toEqual('b1');
    });

    it('should delete correct values', () => {

      const model = new Model('model');

      model.stringField = 'foo';
      model.tempField = 'temp';
      model.subModel.someField = 'a';

      expect(localStorage.getItem('model/stringField')).toEqual('{"val":"foo"}');
      expect(sessionStorage.getItem('model/tempField')).toEqual('{"val":"temp"}');
      expect(localStorage.getItem('model/A/someField')).toEqual('{"val":"a"}');

      model.delete('stringField');
      model.delete('tempField', true);
      model.subModel.delete('someField');

      expect(localStorage.getItem('model/stringField')).toBeNull();
      expect(sessionStorage.getItem('model/tempField')).toBeNull();
      expect(localStorage.getItem('model/A/someField')).toBeNull();
    });
  });

  describe('storage key', () => {

    it('should use field name if no key provided', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage()
        field: string;
      }

      const model = new Model('model');
      model.field = 'foo';

      expect(localStorage.getItem('model/field')).toEqual('{"val":"foo"}');
    });

    it('should honor key if provided', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage('myField')
        field: string;
      }

      const model = new Model('model');
      model.field = 'foo';

      expect(localStorage.getItem('model/myField')).toEqual('{"val":"foo"}');
    });
  });

  describe('default value', () => {

    it('should load default value if nothing stored', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, 'foo')
        field: string;
      }

      const model = new Model('model');

      expect(localStorage.getItem('model/field')).toBeNull();
      expect(model.field).toEqual('foo');
    });

    it('should ignore default if value stored', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, 'foo')
        field: string;
      }

      localStorage.setItem('model/field', '{"val":"bar"}');
      const model = new Model('model');

      expect(model.field).toEqual('bar');
    });

    it('should ignore default if falsy value stored', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, 'foo')
        explicitlyUndefinedField: any;

        @LocalStorage(null, 'foo')
        nullField: any;

        @LocalStorage(null, 'foo')
        emptyStringField: string;

        @LocalStorage(null, true)
        falseBooleanField: boolean;

        @LocalStorage(null, 42)
        zeroNumberField: number;
      }

      localStorage.setItem('model/explicitlyUndefinedField', '{}');
      localStorage.setItem('model/nullField', '{"val":null}');
      localStorage.setItem('model/emptyStringField', '{"val":""}');
      localStorage.setItem('model/falseBooleanField', '{"val":false}');
      localStorage.setItem('model/zeroNumberField', '{"val":0}');
      const model = new Model('model');

      expect(model.explicitlyUndefinedField).toBeUndefined();
      expect(model.nullField).toBeNull();
      expect(model.emptyStringField).toEqual('');
      expect(model.falseBooleanField).toEqual(false);
      expect(model.zeroNumberField).toEqual(0);
    });
  });

  describe('caching', () => {

    it('should load cached value when cache enabled', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, null, true)
        field: string;
      }

      const model = new Model('model');
      model.field = 'foo';

      expect(localStorage.getItem('model/field')).toEqual('{"val":"foo"}');

      localStorage.setItem('model/field', '{"val":"bar"}');

      expect(model.field).toEqual('foo');
    });

    it('should load latest value when cache disabled', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, null, false)
        field: string;
      }

      const model = new Model('model');
      model.field = 'foo';

      expect(localStorage.getItem('model/field')).toEqual('{"val":"foo"}');

      localStorage.setItem('model/field', '{"val":"bar"}');

      expect(model.field).toEqual('bar');
    });
  });

  describe('custom serialization and deserialization', () => {

    it('should use custom serializer if provided', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, null, true, (x) => x.toString(2))
        field: number;
      }

      const model = new Model('model');
      model.field = 42;

      expect(localStorage.getItem('model/field')).toEqual('101010');
    });

    it('should use custom deserializer if provided', () => {

      @Local
      class Model extends LocalModel {
        @LocalStorage(null, null, true, null, (x) => parseInt(x, 2))
          field: number;
      }

      localStorage.setItem('model/field', '101010');
      const model = new Model('model');

      expect(model.field).toEqual(42);
    });
  });
});
