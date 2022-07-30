import * as Result from '../result';
import { Some, None } from '../option';
import { Ok, Err } from '../result';

describe('Result', function () {
  describe('fromNullable', function () {
    test.each([
      { value: '', error: new Error('nullable'), expected: Ok('') },
      { value: 0, error: new Error('nullable'), expected: Ok(0) },
      { value: 1, error: new Error('nullable'), expected: Ok(1) },
      { value: true, error: new Error('nullable'), expected: Ok(true) },
      { value: false, error: new Error('nullable'), expected: Ok(false) },
      { value: {}, error: new Error('nullable'), expected: Ok({}) },
      { value: [], error: new Error('nullable'), expected: Ok([]) },
      { value: void 0, error: new Error('nullable'), expected: Err(new Error('nullable')) },
      { value: null, error: new Error('nullable'), expected: Err(new Error('nullable')) },
    ])('$value is $expected._tag', function ({ value, error, expected }) {
      expect(Result.fromNullable(value, error)).toMatchObject(expected);
    });
  });

  describe('fromFalsy', function () {
    test.each([
      { value: '', error: new Error('falsy'), expected: Err(new Error('falsy')) },
      { value: 0, error: new Error('falsy'), expected: Err(new Error('falsy')) },
      { value: 1, error: new Error('falsy'), expected: Ok(1) },
      { value: true, error: new Error('falsy'), expected: Ok(true) },
      { value: false, error: new Error('falsy'), expected: Err(new Error('falsy')) },
      { value: {}, error: new Error('falsy'), expected: Ok({}) },
      { value: [], error: new Error('falsy'), expected: Ok([]) },
      { value: void 0, error: new Error('falsy'), expected: Err(new Error('falsy')) },
      { value: null, error: new Error('falsy'), expected: Err(new Error('falsy')) },
    ])('$value is $expected._tag', function ({ value, error, expected }) {
      expect(Result.fromFalsy(value, error)).toMatchObject(expected);
    });
  });

  describe('fromPredicate', function () {
    test.each([
      {
        value: true,
        error: new Error('predicate'),
        predicate: (v: boolean) => v,
        expected: Ok(true),
      },
      {
        value: false,
        error: new Error('predicate'),
        predicate: (v: boolean) => v,
        expected: Err(new Error('predicate')),
      },
    ])('$value is $expected._tag', function ({ value, error, predicate, expected }) {
      expect(Result.fromPredicate(value, error, predicate)).toMatchObject(expected);
    });
  });

  describe('toNullable', function () {
    test.each([
      { value: Ok('data'), expected: 'data' },
      { value: Err('error'), expected: null },
    ])('$value._tag is $expected', function ({ value, expected }) {
      expect(Result.toNullable(value)).toEqual(expected);
    });
  });

  describe('toUndefined', function () {
    test.each([
      { value: Ok('data'), expected: 'data' },
      { value: Err('error'), expected: void 0 },
    ])('$value._tag is $expected', function ({ value, expected }) {
      expect(Result.toUndefined(value)).toEqual(expected);
    });
  });

  describe('tryCatch', function () {
    test.each([
      { value: () => 0, expected: Ok(0) },
      { value: () => 1, expected: Ok(1) },
      { value: () => true, expected: Ok(true) },
      { value: () => false, expected: Ok(false) },
      { value: () => ({}), expected: Ok({}) },
      { value: () => [], expected: Ok([]) },
      {
        value: () => {
          throw new Error('Error');
        },
        expected: Err(new Error('Error')),
      },
    ])('$value is $expected._tag', function ({ value, expected }) {
      expect(Result.tryCatch(value)).toMatchObject(expected);
    });
  });

  describe('Ok', function () {
    const DATA = 1;
    const OBJ = Ok<number, string>(DATA);

    test('is_ok', function () {
      expect(Result.is_ok(OBJ)).toBe(true);
    });

    test('is_err', function () {
      expect(Result.is_err(OBJ)).toBe(false);
    });

    test('contains', function () {
      expect(Result.contains(OBJ, DATA)).toBe(true);
    });

    test('contains_err', function () {
      expect(Result.contains_err(OBJ, 'Error')).toBe(false);
    });

    test('ok', function () {
      expect(Result.ok(OBJ)).toMatchObject(Some(DATA));
    });

    test('err', function () {
      expect(Result.err(OBJ)).toMatchObject(None());
    });

    test('map', function () {
      expect(Result.map(OBJ, (value) => value + 1)).toMatchObject(Ok(2));
    });

    test('map_or', function () {
      expect(Result.map_or(OBJ, 0, (value) => value + 1)).toBe(2);
    });

    test('map_or_else', function () {
      expect(
        Result.map_or_else(
          OBJ,
          (error) => 0,
          (value) => value + 1
        )
      ).toBe(2);
    });

    test('map_err', function () {
      expect(Result.map_err(OBJ, (error) => 0)).toMatchObject(Ok(DATA));
    });

    test('and', function () {
      const data = { n: 0 };
      expect(Result.and(OBJ, Ok(data))).toMatchObject(Ok(data));
    });

    test('and_then', function () {
      expect(Result.and_then(OBJ, (value) => Ok(value + 1))).toMatchObject(Ok(2));
    });

    test('or', function () {
      expect(Result.or(OBJ, Ok(0))).toMatchObject(Ok(DATA));
    });

    test('or_else', function () {
      expect(Result.or_else(OBJ, (error) => Ok(0))).toMatchObject(Ok(DATA));
    });

    test('unwrap_or', function () {
      expect(Result.unwrap_or(OBJ, 0)).toEqual(DATA);
    });

    test('unwrap_or_else', function () {
      expect(Result.unwrap_or_else(OBJ, (error) => 0)).toEqual(DATA);
    });

    test('expect', function () {
      expect(Result.expect(OBJ, 'Error')).toEqual(DATA);
    });

    test('unwrap', function () {
      expect(Result.unwrap(OBJ)).toEqual(DATA);
    });

    test('expect_err', function () {
      expect.assertions(1);

      expect(() => Result.expect_err(OBJ, 'Error')).toThrow('Error: 1');
    });

    test('unwrap_err', function () {
      expect.assertions(1);

      expect(() => Result.unwrap_err(OBJ)).toThrow('1');
    });

    test('toString', function () {
      expect(Result.toString(OBJ)).toEqual('Result::Ok(1)');
    });

    test('tap', function () {
      const tapFn = jest.fn();
      expect(Result.tap(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).toBeCalledWith(DATA);
    });

    test('tap_err', function () {
      const tapFn = jest.fn();
      expect(Result.tap_err(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).not.toBeCalled();
    });
  });

  describe('Err (string)', function () {
    const ERROR = 'not a number';
    const OBJ = Err<string, number>(ERROR);

    test('is_ok', function () {
      expect(Result.is_ok(OBJ)).toBe(false);
    });

    test('is_err', function () {
      expect(Result.is_err(OBJ)).toBe(true);
    });

    test('contains', function () {
      expect(Result.contains(OBJ, 0)).toBe(false);
    });

    test('contains_err', function () {
      expect(Result.contains_err(OBJ, ERROR)).toBe(true);
    });

    test('ok', function () {
      expect(Result.ok(OBJ)).toMatchObject(None());
    });

    test('err', function () {
      expect(Result.err(OBJ)).toMatchObject(Some(ERROR));
    });

    test('map', function () {
      expect(Result.map(OBJ, (value) => value + 1)).toMatchObject(Err(ERROR));
    });

    test('map_or', function () {
      expect(Result.map_or(OBJ, 0, (value) => value + 1)).toBe(0);
    });

    test('map_or_else', function () {
      expect(
        Result.map_or_else(
          OBJ,
          (error) => 0,
          (value) => value + 1
        )
      ).toBe(0);
    });

    test('map_err', function () {
      expect(Result.map_err(OBJ, (error) => 'not a what?')).toMatchObject(Err('not a what?'));
    });

    test('and', function () {
      const data = { n: 0 };
      expect(Result.and(OBJ, Ok(data))).toMatchObject(Err(ERROR));
    });

    test('and_then', function () {
      expect(Result.and_then(OBJ, (value) => Ok(value + 1))).toMatchObject(Err(ERROR));
    });

    test('or', function () {
      expect(Result.or(OBJ, Ok(0))).toMatchObject(Ok(0));
    });

    test('or_else', function () {
      expect(Result.or_else(OBJ, (error) => Ok(0))).toMatchObject(Ok(0));
    });

    test('unwrap_or', function () {
      expect(Result.unwrap_or(OBJ, 0)).toEqual(0);
    });

    test('unwrap_or_else', function () {
      expect(Result.unwrap_or_else(OBJ, (error) => 0)).toEqual(0);
    });

    test('expect', function () {
      expect(() => Result.expect(OBJ, 'Error')).toThrow(`Error: ${ERROR}`);
    });

    test('unwrap', function () {
      expect(() => Result.unwrap(OBJ)).toThrow(ERROR);
    });

    test('expect_err', function () {
      expect.assertions(1);

      expect(Result.expect_err(OBJ, 'Error')).toEqual(ERROR);
    });

    test('unwrap_err', function () {
      expect.assertions(1);

      expect(Result.unwrap_err(OBJ)).toEqual(ERROR);
    });

    test('toString', function () {
      expect(Result.toString(OBJ)).toEqual('Result::Err("not a number")');
    });

    test('tap', function () {
      const tapFn = jest.fn();
      expect(Result.tap(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).not.toBeCalled();
    });

    test('tap_err', function () {
      const tapFn = jest.fn();
      expect(Result.tap_err(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).toBeCalledWith(ERROR);
    });
  });

  describe('Err (Exception)', function () {
    const ERROR = new Error('not a number');
    const OBJ = Err<Error, number>(ERROR);

    test('is_ok', function () {
      expect(Result.is_ok(OBJ)).toBe(false);
    });

    test('is_err', function () {
      expect(Result.is_err(OBJ)).toBe(true);
    });

    test('contains', function () {
      expect(Result.contains(OBJ, 0)).toBe(false);
    });

    test('contains_err', function () {
      expect(Result.contains_err(OBJ, ERROR)).toBe(true);
    });

    test('ok', function () {
      expect(Result.ok(OBJ)).toMatchObject(None());
    });

    test('err', function () {
      expect(Result.err(OBJ)).toMatchObject(Some(ERROR));
    });

    test('map', function () {
      expect(Result.map(OBJ, (value) => value + 1)).toMatchObject(Err(ERROR));
    });

    test('map_or', function () {
      expect(Result.map_or(OBJ, 0, (value) => value + 1)).toBe(0);
    });

    test('map_or_else', function () {
      expect(
        Result.map_or_else(
          OBJ,
          (error) => 0,
          (value) => value + 1
        )
      ).toBe(0);
    });

    test('map_err', function () {
      expect(Result.map_err(OBJ, (error) => 'not a what?')).toMatchObject(Err('not a what?'));
    });

    test('and', function () {
      const data = { n: 0 };
      expect(Result.and(OBJ, Ok(data))).toMatchObject(Err(ERROR));
    });

    test('and_then', function () {
      expect(Result.and_then(OBJ, (value) => Ok(value + 1))).toMatchObject(Err(ERROR));
    });

    test('or', function () {
      expect(Result.or(OBJ, Ok(0))).toMatchObject(Ok(0));
    });

    test('or_else', function () {
      expect(Result.or_else(OBJ, (error) => Ok(0))).toMatchObject(Ok(0));
    });

    test('unwrap_or', function () {
      expect(Result.unwrap_or(OBJ, 0)).toEqual(0);
    });

    test('unwrap_or_else', function () {
      expect(Result.unwrap_or_else(OBJ, (error) => 0)).toEqual(0);
    });

    test('expect', function () {
      expect(() => Result.expect(OBJ, 'Error')).toThrow(`Error: ${ERROR}`);
    });

    test('unwrap', function () {
      expect(() => Result.unwrap(OBJ)).toThrow(ERROR);
    });

    test('expect_err', function () {
      expect.assertions(1);

      expect(Result.expect_err(OBJ, 'Error')).toEqual(ERROR);
    });

    test('unwrap_err', function () {
      expect.assertions(1);

      expect(Result.unwrap_err(OBJ)).toEqual(ERROR);
    });

    test('toString', function () {
      expect(Result.toString(OBJ)).toEqual('Result::Err("not a number")');
    });

    test('tap', function () {
      const tapFn = jest.fn();
      expect(Result.tap(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).not.toBeCalled();
    });

    test('tap_err', function () {
      const tapFn = jest.fn();
      expect(Result.tap_err(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).toBeCalledWith(ERROR);
    });
  });
});
