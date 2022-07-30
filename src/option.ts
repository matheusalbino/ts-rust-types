import { type Result, Err, Ok } from './result';

export interface Some<T> {
  /**
   * @internal
   */
  $typeof: 'Option::Some';
  /**
   * @internal
   */
  value: NonNullable<T>;
}

export interface None {
  /**
   * @internal
   */
  $typeof: 'Option::None';
  /**
   * @internal
   */
  value: never;
}

export type Option<T> = Some<T> | None;

export function Some<T>(value: NonNullable<T>): Option<T> {
  return { $typeof: 'Option::Some', value };
}

export function None<T>(): Option<T> {
  return { $typeof: 'Option::None', value: undefined as never };
}

export function fromNullable<T>(value: T): Option<NonNullable<T>> {
  if (value === undefined || value === null) {
    return None();
  }

  return Some(value as NonNullable<T>) as Option<NonNullable<T>>;
}

export function fromFalsy<T>(value: T): Option<NonNullable<T>> {
  if (!value) {
    return None();
  }

  return Some(value as NonNullable<T>) as Option<NonNullable<T>>;
}

export function fromPredicate<T>(
  value: T,
  predicateFn: (value: T) => boolean
): Option<NonNullable<T>> {
  if (!predicateFn(value)) {
    return None();
  }

  return Some(value as NonNullable<T>) as Option<NonNullable<T>>;
}

export function toNullable<T>(option: Option<T>): T | null {
  if (is_none(option)) {
    return null;
  }

  return option.value;
}

export function toUndefined<T>(option: Option<T>): T | undefined {
  if (is_none(option)) {
    return void 0;
  }

  return option.value;
}

export function is_some<T>(value: Option<T>): value is Some<T> {
  return value.$typeof === 'Option::Some';
}

export function is_none<T>(value: Option<T>): value is None {
  return value.$typeof === 'Option::None';
}

/**
 * Returns true if the option is a `Some` value containing the given value.
 */
export function contains<T>(option: Option<T>, value: T): boolean {
  if (is_none(option)) {
    return false;
  }

  return option.value === value;
}

/**
 * Returns the contained `Some` value, consuming the self value.
 *
 * @throws If the value is `None` with a custom message provided by *msg*
 */
export function expect<T>(option: Option<T>, msg: string): T {
  if (is_some(option)) {
    return option.value;
  }

  throw new Error(msg);
}

/**
 * Returns the contained `Some` value, consuming the self value.
 *
 * Because this function may panic, its use is generally discouraged. Instead, prefer to use pattern matching and handle the `None` case explicitly, or call `unwrap_or` or `unwrap_or_else`.
 *
 * @throws If the value is `None`
 */
export function unwrap<T>(option: Option<T>): T {
  if (is_some(option)) {
    return option.value;
  }

  throw new Error('option is none');
}

/**
 * Returns the contained `Some` value or a provided default.
 */
export function unwrap_or<T>(option: Option<T>, defaultValue: T): T {
  if (is_some(option)) {
    return option.value;
  }

  return defaultValue;
}

/**
 * Returns the contained `Some` value or computes it from a closure.
 */
export function unwrap_or_else<T>(option: Option<T>, fn: () => T): T {
  if (is_some(option)) {
    return option.value;
  }

  return fn();
}

/**
 * Maps an `Option<T>` to `Option<U>` by applying a function to a contained value.
 */
export function map<T, U>(option: Option<T>, op: (value: T) => NonNullable<U>): Option<U> {
  if (is_none(option)) {
    return option;
  }

  return Some<U>(op(option.value));
}

/**
 * Returns the provided default result (if none), or applies a function to the contained value (if any).
 */
export function map_or<T, U>(option: Option<T>, defaultValue: U, fn: (value: T) => U): U {
  if (is_none(option)) {
    return defaultValue;
  }

  return fn(option.value);
}

/**
 * Computes a default function result (if none), or applies a different function to the contained value (if any).
 */
export function map_or_else<T, U>(option: Option<T>, defaultFn: () => U, fn: (value: T) => U): U {
  if (is_none(option)) {
    return defaultFn();
  }

  return fn(option.value);
}

/**
 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(T)` to `Ok(T)` and `None` to `Err(err)`.
 */
export function ok_or<T, E>(option: Option<T>, err: NonNullable<E>): Result<T, E> {
  if (is_none(option)) {
    return Err(err);
  }

  return Ok(option.value as NonNullable<T>);
}

/**
 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(T)` to `Ok(T)` and `None` to `Err(err())`.
 */
export function ok_or_else<T, E>(option: Option<T>, err: () => NonNullable<E>): Result<T, E> {
  if (is_none(option)) {
    return Err(err());
  }

  return Ok(option.value as NonNullable<T>);
}

/**
 * Returns `None` if the option is `None`, otherwise returns *optb*.
 */
export function and<T, U>(option: Option<T>, optb: Option<U>): Option<U> {
  if (is_none(option)) {
    return option;
  }

  return optb;
}

/**
 * Returns `None` if the option is `None`, otherwise calls *fn* with the wrapped value and returns the result.
 * Some languages call this operation flatmap.
 */
export function and_then<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  if (is_none(option)) {
    return option;
  }

  return fn(option.value);
}

/**
 * Returns `None` if the option is `None`, otherwise calls predicate with the wrapped value and returns:
 * - `Some(T)` if predicate returns **true** (where T is the wrapped value), and
 * - `None` if predicate returns **false**.
 */
export function filter<T>(option: Option<T>, fn: (value: T) => boolean): Option<T> {
  if (is_none(option)) {
    return option;
  }

  if (fn(option.value as T)) {
    return option;
  }

  return None();
}

/**
 * Returns the option if it contains a value, otherwise returns *optb*.
 * Arguments passed to or are eagerly evaluated; if you are passing the result of a function call, it is recommended to use `or_else`, which is lazily evaluated.
 */
export function or<T>(option: Option<T>, optb: Option<T>): Option<T> {
  if (is_some(option)) {
    return option;
  }

  return optb;
}

/**
 * Returns the option if it contains a value, otherwise calls *fn* and returns the result.
 */
export function or_else<T>(option: Option<T>, fn: () => Option<T>): Option<T> {
  if (is_some(option)) {
    return option;
  }

  return fn();
}

/**
 * Returns `Some` if exactly one of *self*, *optb* is `Some`, otherwise returns `None`.
 */
export function xor<T>(option: Option<T>, optb: Option<T>): Option<T> {
  if (is_some(option) && is_none(optb)) {
    return option;
  }

  if (is_none(option) && is_some(optb)) {
    return optb;
  }

  return None();
}

/**
 * Takes the value out of the option, leaving a `None` in its place.
 */
export function take<T>(option: Option<T>): Option<T> {
  if (is_none(option)) {
    return None();
  }

  const res = Some<T>(option.value);

  transformToNone(option);

  return res;
}

/**
 * Replaces the actual value in the option by the value given in parameter, returning the old value if present, leaving a `Some` in its place without deinitializing either one.
 */
export function replace<T>(option: Option<T>, value: T): Option<T> {
  if (is_none(option)) {
    transformToSome(option, value);

    return None();
  }

  const res = Some(option.value);

  option.value = value as NonNullable<T>;

  return res;
}

export function toString<T>(option: Option<T>): string {
  if (is_some(option)) {
    return `${option.$typeof}(${JSON.stringify(option.value)})`;
  }

  return option.$typeof;
}

/**
 * Applies a side effect function to the value in `Some`, and returns the original option.
 */
export function tap<T>(option: Option<T>, fn: (value: T) => void): Option<T> {
  if (is_some(option)) {
    fn(option.value);
  }

  return option;
}

/**
 * Applies a side effect function to the value in `None`, and returns the original option.
 */
export function tap_none<T>(option: Option<T>, fn: () => void): Option<T> {
  if (is_none(option)) {
    fn();
  }

  return option;
}

function transformToNone<T>(option: Option<T>): void {
  const $option = option as unknown as None;
  $option.$typeof = 'Option::None';
  $option.value = undefined as never;
}

function transformToSome<T>(option: Option<T>, value: T): void {
  const $option = option as unknown as Some<T>;
  $option.$typeof = 'Option::Some';
  $option.value = value as NonNullable<T>;
}
