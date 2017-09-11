import {} from 'jasmine';
import './jest-global-mocks';
import { LocalModel } from '../local-model';
import { Local, LocalStorage, SessionStorage } from '../decorators';

describe('decorators', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('storing and loading', () => {
    @Local
    class Model extends LocalModel {
      @LocalStorage()
      stringField: string;

      @LocalStorage()
      numberField: number;

      @LocalStorage()
      anyField: any;

      @LocalStorage()
      arrayField: number[];

      @SessionStorage()
      stringFieldTemp: string;

      @SessionStorage()
      numberFieldTemp: number;

      @SessionStorage()
      anyFieldTemp: any;

      @SessionStorage()
      arrayFieldTemp: number[];

      subModelA: SubModel = new SubModel(this.subpath('A'));
      subModelB: SubModel = new SubModel(this.subpath('B'));
    }

    @Local
    class SubModel extends LocalModel {
      @LocalStorage()
      someField: string;
    }

    it('should store correct values', () => {
      const model = new Model('model');

      model.stringField = 'foo';
      model.numberField = 42.314;
      model.anyField = { foo: 'bar' };
      model.arrayField = [1, 2, 3];

      model.stringFieldTemp = 'bar';
      model.numberFieldTemp = 3.14;
      model.anyFieldTemp = { fizz: 'buzz' };
      model.arrayFieldTemp = [4, 5, 6];

      model.subModelA.someField = 'a';
      model.subModelB.someField = 'b';

      expect(localStorage['model/stringField']).toEqual('{"val":"foo"}');
      expect(localStorage['model/numberField']).toEqual('{"val":42.314}');
      expect(localStorage['model/anyField']).toEqual('{"val":{"foo":"bar"}}');
      expect(localStorage['model/arrayField']).toEqual('{"val":[1,2,3]}');

      expect(sessionStorage['model/stringFieldTemp']).toEqual('{"val":"bar"}');
      expect(sessionStorage['model/numberFieldTemp']).toEqual('{"val":3.14}');
      expect(sessionStorage['model/anyFieldTemp']).toEqual('{"val":{"fizz":"buzz"}}');
      expect(sessionStorage['model/arrayFieldTemp']).toEqual('{"val":[4,5,6]}');

      expect(localStorage['model/A/someField']).toEqual('{"val":"a"}');
      expect(localStorage['model/B/someField']).toEqual('{"val":"b"}');
    });

    it('should load correct values', () => {
      localStorage['model/stringField'] = '{"val":"foo"}';
      localStorage['model/numberField'] = '{"val":42.314}';
      localStorage['model/anyField'] = '{"val":{"foo":"bar"}}';
      localStorage['model/arrayField'] = '{"val":[1,2,3]}';

      sessionStorage['model/stringFieldTemp'] = '{"val":"bar"}';
      sessionStorage['model/numberFieldTemp'] = '{"val":3.14}';
      sessionStorage['model/anyFieldTemp'] = '{"val":{"fizz":"buzz"}}';
      sessionStorage['model/arrayFieldTemp'] = '{"val":[4,5,6]}';

      localStorage['model/A/someField'] = '{"val":"a"}';
      localStorage['model/B/someField'] = '{"val":"b"}';

      const model = new Model('model');

      expect(model.stringField).toEqual('foo');
      expect(model.numberField).toEqual(42.314);
      expect(model.anyField).toEqual({ foo: 'bar' });
      expect(model.arrayField).toEqual([1, 2, 3]);
      expect(model.subModelA.someField).toEqual('a');
      expect(model.subModelB.someField).toEqual('b');

      expect(model.stringFieldTemp).toEqual('bar');
      expect(model.numberFieldTemp).toEqual(3.14);
      expect(model.anyFieldTemp).toEqual({ fizz: 'buzz' });
      expect(model.arrayFieldTemp).toEqual([4, 5, 6]);
    });
  });

  describe('storage key', () => {
    it('should use field name if no key provided', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage()
        field: string = 'foo';
      }

      const model = new Model('model');
      expect(localStorage['model/field']).toEqual('{"val":"foo"}');
    });

    it('should honor key if provided', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage('myField')
        field: string = 'foo';
      }

      const model = new Model('model');
      expect(localStorage['model/myField']).toEqual('{"val":"foo"}');
    });
  });

  describe('caching', () => {
    it('should load cached value when cache enabled', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage(null, true)
        field: string = 'foo';
      }

      const model = new Model('model');
      expect(localStorage['model/field']).toEqual('{"val":"foo"}');

      localStorage['model/field'] = '{"val":"bar"}';
      expect(model.field).toEqual('foo');
    });

    it('should not load cached value when cache disabled', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage(null, false)
        field: string = 'foo';
      }

      const model = new Model('model');
      expect(localStorage['model/field']).toEqual('{"val":"foo"}');

      localStorage['model/field'] = '{"val":"bar"}';
      expect(model.field).toEqual('bar');
    });
  });

  describe('custom serialization and deserialization', () => {
    it('should use custom serializer if provided', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage(null, true, (x) => x.toString(2))
        field: number = 42;
      }

      const model = new Model('model');
      expect(localStorage['model/field']).toEqual('101010');
    });

    it('should use custom deserializer if provided', () => {
      @Local
      class Model extends LocalModel {
        @LocalStorage(null, true, null, (x) => parseInt(x, 2))
          field: number;
      }

      localStorage['model/field'] = '101010';

      const model = new Model('model');
      expect(model.field).toEqual(42);
    });
  });
});
