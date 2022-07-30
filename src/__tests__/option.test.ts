import * as Option from '../option';
import { Some, None } from '../option';
import { Ok, Err } from '../result';

describe('Option', () => {
  const DATA = 1;

  describe('fromNullable', function () {
    test.each([
      { value: '', expected: Some('') },
      { value: 0, expected: Some(0) },
      { value: 1, expected: Some(1) },
      { value: true, expected: Some(true) },
      { value: false, expected: Some(false) },
      { value: {}, expected: Some({}) },
      { value: [], expected: Some([]) },
      { value: void 0, expected: None() },
      { value: null, expected: None() },
      { value: new Error('Error'), expected: Some(new Error('Error')) },
    ])('$value is $expected._tag', function ({ value, expected }) {
      expect(Option.fromNullable(value)).toMatchObject(expected);
    });
  });

  describe('fromFalsy', function () {
    test.each([
      { value: '', expected: None() },
      { value: 0, expected: None() },
      { value: 1, expected: Some(1) },
      { value: true, expected: Some(true) },
      { value: false, expected: None() },
      { value: {}, expected: Some({}) },
      { value: [], expected: Some([]) },
      { value: void 0, expected: None() },
      { value: null, expected: None() },
      { value: new Error('Error'), expected: Some(new Error('Error')) },
    ])('$value is $expected._tag', function ({ value, expected }) {
      expect(Option.fromFalsy(value)).toMatchObject(expected);
    });
  });

  describe('fromPredicate', function () {
    test.each([
      { value: true, predicate: (v: boolean) => v, expected: Some(true) },
      { value: false, predicate: (v: boolean) => v, expected: None() },
    ])('$value is $expected._tag', function ({ value, predicate, expected }) {
      expect(Option.fromPredicate(value, predicate)).toMatchObject(expected);
    });
  });

  describe('toNullable', function () {
    test.each([
      { value: Some(0), expected: 0 },
      { value: None(), expected: null },
    ])('$value._tag is $expected', function ({ value, expected }) {
      expect(Option.toNullable(value)).toEqual(expected);
    });
  });

  describe('toUndefined', function () {
    test.each([
      { value: Some(0), expected: 0 },
      { value: None(), expected: void 0 },
    ])('$value._tag is $expected', function ({ value, expected }) {
      expect(Option.toUndefined(value)).toEqual(expected);
    });
  });

  describe('Some', function () {
    let OBJ: Option.Option<number>;

    beforeEach(function () {
      OBJ = Some(DATA);
    });

    test('is_some', function () {
      expect(Option.is_some(OBJ)).toEqual(true);
    });

    test('is_none', function () {
      expect(Option.is_none(OBJ)).toEqual(false);
    });

    test('contains', function () {
      expect(Option.contains(OBJ, DATA)).toEqual(true);
    });

    test('expect', function () {
      expect(() => Option.expect(OBJ, 'Nothing')).not.toThrow('Nothing');
    });

    test('unwrap', function () {
      expect(() => Option.unwrap(OBJ)).not.toThrow('option is none');
    });

    test('unwrap_or', function () {
      expect(Option.unwrap_or(OBJ, 2)).toEqual(DATA);
    });

    test('unwrap_or_else', function () {
      expect(Option.unwrap_or_else(OBJ, () => 2)).toEqual(DATA);
    });

    test('map', function () {
      expect(Option.map(OBJ, (value) => value + 1)).toMatchObject(Some(2));
    });

    test('map_or', function () {
      expect(Option.map_or(OBJ, 0, (value) => value + 1)).toEqual(2);
    });

    test('map_or_else', function () {
      expect(
        Option.map_or_else(
          OBJ,
          () => 0,
          (value) => value + 1
        )
      ).toEqual(2);
    });

    test('ok_or', function () {
      expect(Option.ok_or(OBJ, new Error('Error'))).toMatchObject(Ok(DATA));
    });

    test('ok_or_else', function () {
      expect(Option.ok_or_else(OBJ, () => new Error('Error'))).toMatchObject(Ok(DATA));
    });

    test('and', function () {
      expect(Option.and(OBJ, Some(2))).toMatchObject(Some(2));
    });

    test('and_then', function () {
      expect(Option.and_then(OBJ, (value) => Some(value + 1))).toMatchObject(Some(2));
    });

    test('filter', function () {
      expect(Option.filter(OBJ, (value) => value === DATA)).toMatchObject(Some(DATA));
      expect(Option.filter(OBJ, (value) => value !== DATA)).toMatchObject(None());
    });

    test('or', function () {
      expect(Option.or(OBJ, Some(2))).toMatchObject(Some(DATA));
    });

    test('or_else', function () {
      expect(Option.or_else(OBJ, () => Some(2))).toMatchObject(Some(DATA));
    });

    test.each([
      [Some(2), None()],
      [None(), Some(1)],
    ])('%s xor %s', function (value, expected) {
      expect(Option.xor(OBJ, value)).toMatchObject(expected);
    });

    test('take', function () {
      expect(Option.take(OBJ)).toMatchObject(Some(DATA));
      expect(OBJ).toMatchObject(None());
    });

    test('replace', function () {
      expect(Option.replace(OBJ, 2)).toMatchObject(Some(DATA));
      expect(OBJ).toMatchObject(Some(2));
    });

    test('toString', function () {
      expect(Option.toString(OBJ)).toEqual('Option::Some(1)');
    });

    test('tap', function () {
      const tapFn = jest.fn();
      expect(Option.tap(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).toBeCalledWith(DATA);
    });

    test('tap_none', function () {
      const tapFn = jest.fn();
      expect(Option.tap_none(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).not.toBeCalled();
    });
  });

  describe('None', function () {
    let OBJ: Option.Option<number>;

    beforeEach(function () {
      OBJ = None();
    });

    test('is_some', function () {
      expect(Option.is_some(OBJ)).toEqual(false);
    });

    test('is_none', function () {
      expect(Option.is_none(OBJ)).toEqual(true);
    });

    test('contains', function () {
      expect(Option.contains(OBJ, DATA)).toEqual(false);
    });

    test('expect', function () {
      expect(() => Option.expect(OBJ, 'Nothing')).toThrow('Nothing');
    });

    test('unwrap', function () {
      expect(() => Option.unwrap(OBJ)).toThrow('option is none');
    });

    test('unwrap_or', function () {
      expect(Option.unwrap_or(OBJ, 2)).toEqual(2);
    });

    test('unwrap_or_else', function () {
      expect(Option.unwrap_or_else(OBJ, () => 2)).toEqual(2);
    });

    test('map', function () {
      expect(Option.map(OBJ, (value: number) => value + 1)).toMatchObject(None());
    });

    test('map_or', function () {
      expect(Option.map_or(OBJ, 0, (value: number) => value + 1)).toEqual(0);
    });

    test('map_or_else', function () {
      expect(
        Option.map_or_else(
          OBJ,
          () => 0,
          (value: number) => value + 1
        )
      ).toEqual(0);
    });

    test('ok_or', function () {
      expect(Option.ok_or(OBJ, new Error('Error'))).toMatchObject(Err(new Error('Error')));
    });

    test('ok_or_else', function () {
      expect(Option.ok_or_else(OBJ, () => new Error('Error'))).toMatchObject(
        Err(new Error('Error'))
      );
    });

    test('and', function () {
      expect(Option.and(OBJ, Some(2))).toMatchObject(None());
    });

    test('and_then', function () {
      expect(Option.and_then(OBJ, (value: number) => Some(value + 1))).toMatchObject(None());
    });

    test('filter', function () {
      expect(Option.filter(OBJ, (value) => value === DATA)).toMatchObject(None());
      expect(Option.filter(OBJ, (value) => value !== DATA)).toMatchObject(None());
    });

    test('or', function () {
      expect(Option.or(OBJ, Some(2))).toMatchObject(Some(2));
    });

    test('or_else', function () {
      expect(Option.or_else(OBJ, () => Some(2))).toMatchObject(Some(2));
    });

    test.each([
      [Some(2), Some(2)],
      [None(), None()],
    ])('%s xor %s', function (value, expected) {
      expect(Option.xor(OBJ, value)).toMatchObject(expected);
    });

    test('take', function () {
      expect(Option.take(OBJ)).toMatchObject(None());
      expect(OBJ).toMatchObject(None());
    });

    test('replace', function () {
      expect(Option.replace(OBJ, 2)).toMatchObject(None());
      expect(OBJ).toMatchObject(Some(2));
    });

    test('toString', function () {
      expect(Option.toString(OBJ)).toEqual('Option::None');
    });

    test('tap', function () {
      const tapFn = jest.fn();
      expect(Option.tap(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).not.toBeCalled();
    });

    test('tap_none', function () {
      const tapFn = jest.fn();
      expect(Option.tap_none(OBJ, tapFn)).toMatchObject(OBJ);
      expect(tapFn).toBeCalledWith();
    });
  });
});
