import {} from 'jasmine';
import './jest-global-mocks';
import {LocalStorage, SessionStorage} from '../decorators';

describe('decorators', () => {

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('storing and loading', () => {
    class Model {
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
    }

    it('should store values', () => {
      const model = new Model();

      model.stringField = 'foo';
      model.numberField = 42.314;
      model.anyField = { foo: 'bar' };
      model.arrayField = [1, 2, 3];

      model.stringFieldTemp = 'bar';
      model.numberFieldTemp = 3.14;
      model.anyFieldTemp = { fizz: 'buzz' };
      model.arrayFieldTemp = [4, 5, 6];

      expect(localStorage['stringField']).toEqual('{"v":"foo"}');
      expect(localStorage['numberField']).toEqual('{"v":42.314}');
      expect(localStorage['anyField']).toEqual('{"v":{"foo":"bar"}}');
      expect(localStorage['arrayField']).toEqual('{"v":[1,2,3]}');

      expect(sessionStorage['stringFieldTemp']).toEqual('{"v":"bar"}');
      expect(sessionStorage['numberFieldTemp']).toEqual('{"v":3.14}');
      expect(sessionStorage['anyFieldTemp']).toEqual('{"v":{"fizz":"buzz"}}');
      expect(sessionStorage['arrayFieldTemp']).toEqual('{"v":[4,5,6]}');
    });

    it('should load values', () => {
      localStorage['stringField'] = '{"v":"foo"}';
      localStorage['numberField'] = '{"v":42.314}';
      localStorage['anyField'] = '{"v":{"foo":"bar"}}';
      localStorage['arrayField'] = '{"v":[1,2,3]}';

      sessionStorage['stringFieldTemp'] = '{"v":"bar"}';
      sessionStorage['numberFieldTemp'] = '{"v":3.14}';
      sessionStorage['anyFieldTemp'] = '{"v":{"fizz":"buzz"}}';
      sessionStorage['arrayFieldTemp'] = '{"v":[4,5,6]}';

      const model = new Model();

      expect(model.stringField).toEqual('foo');
      expect(model.numberField).toEqual(42.314);
      expect(model.anyField).toEqual({ foo: 'bar' });
      expect(model.arrayField).toEqual([1, 2, 3]);

      expect(model.stringFieldTemp).toEqual('bar');
      expect(model.numberFieldTemp).toEqual(3.14);
      expect(model.anyFieldTemp).toEqual({ fizz: 'buzz' });
      expect(model.arrayFieldTemp).toEqual([4, 5, 6]);
    });
  });

  describe('storage key', () => {
    it('should use field name if no key provided', () => {
      class Model {
        @LocalStorage()
        field: string = 'foo';
      }

      const model = new Model();

      expect(localStorage['field']).toEqual('{"v":"foo"}');
    });

    it('should honor key if provided', () => {
      class Model {
        @LocalStorage('myField')
        field: string = 'foo';
      }

      const model = new Model();

      expect(localStorage['myField']).toEqual('{"v":"foo"}');
    });
  });

  describe('caching', () => {
    it('should load cached value when cache enabled', () => {
      class Model {
        @LocalStorage(null, true)
        field: string = 'foo';
      }

      const model = new Model();

      expect(localStorage['field']).toEqual('{"v":"foo"}');

      localStorage['field'] = '{"v":"bar"}';

      expect(model.field).toEqual('foo');
    });

    it('should not load cached value when cache disabled', () => {
      class Model {
        @LocalStorage(null, false)
        field: string = 'foo';
      }

      const model = new Model();

      expect(localStorage['field']).toEqual('{"v":"foo"}');

      localStorage['field'] = '{"v":"bar"}';

      expect(model.field).toEqual('bar');
    });
  });
});
