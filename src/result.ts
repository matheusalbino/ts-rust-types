import { type Option, None, Some } from './option';

export interface Ok<T, E> {
  /**
   * @internal
   */
  $typeof: 'Result::Ok';
  /**
   * @internal
   */
  value: NonNullable<T>;
  /**
   * @internal
   */
  error: never;
}

export interface Err<E, T> {
  /**
   * @internal
   */
  $typeof: 'Result::Err';
  /**
   * @internal
   */
  value: never;
  /**
   * @internal
   */
  error: NonNullable<E>;
}

export type Result<T, E> = Ok<T, E> | Err<E, T>;

export function Ok<T, E>(value: NonNullable<T>): Result<T, E> {
  return { $typeof: 'Result::Ok', value, error: undefined as never };
}

export function Err<E, T>(error: NonNullable<E>): Result<T, E> {
  return { $typeof: 'Result::Err', value: undefined as never, error };
}

export function fromNullable<T, E>(value: T, error: NonNullable<E>): Result<T, E> {
  if (value === void 0 || value === null) {
    return Err<E, NonNullable<T>>(error);
  }

  return Ok<T, E>(value as NonNullable<T>);
}

export function fromFalsy<T, E>(value: T, error: NonNullable<E>): Result<T, E> {
  if (!value) {
    return Err<E, NonNullable<T>>(error);
  }

  return Ok<T, E>(value as NonNullable<T>);
}

export function fromPredicate<T, E>(
  value: T,
  error: NonNullable<E>,
  predicateFn: (value: T) => boolean
): Result<T, E> {
  if (!predicateFn(value)) {
    return Err<E, NonNullable<T>>(error);
  }

  return Ok<T, E>(value as NonNullable<T>);
}

export function toNullable<T, E>(result: Result<T, E>): T | null {
  if (is_err(result)) {
    return null;
  }

  return result.value;
}

export function toUndefined<T, E>(result: Result<T, E>): T | undefined {
  if (is_err(result)) {
    return void 0;
  }

  return result.value;
}

export function tryCatch<T, E>(fn: () => NonNullable<T>): Result<T, E> {
  try {
    return Ok<T, E>(fn());
  } catch (error: any) {
    return Err<E, T>(error);
  }
}

export function is_ok<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.$typeof === 'Result::Ok';
}

export function is_err<T, E>(result: Result<T, E>): result is Err<E, T> {
  return result.$typeof === 'Result::Err';
}

export function ok<T, E>(result: Result<T, E>): Option<T> {
  if (is_ok(result)) {
    return Some<T>(result.value);
  }

  return None();
}

export function err<T, E>(result: Result<T, E>): Option<E> {
  if (is_err(result)) {
    return Some<E>(result.error);
  }

  return None();
}

export function contains<T, E>(result: Result<T, E>, value: T): boolean {
  if (is_err(result)) {
    return false;
  }

  return result.value === value;
}

export function contains_err<T, E>(result: Result<T, E>, error: E): boolean {
  if (is_ok(result)) {
    return false;
  }

  return result.error === error;
}

export function map<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => NonNullable<U>
): Result<U, E> | Result<T, E> {
  if (is_err(result)) {
    return result;
  }

  return Ok<U, E>(fn(result.value));
}

export function map_or<T, E, U>(result: Result<T, E>, defaultValue: U, fn: (value: T) => U): U {
  if (is_err(result)) {
    return defaultValue;
  }

  return fn(result.value);
}

export function map_or_else<T, E, U>(
  result: Result<T, E>,
  defaultFn: (error: E) => U,
  fn: (value: T) => U
): U {
  if (is_err(result)) {
    return defaultFn(result.error);
  }

  return fn(result.value);
}

export function map_err<T, E, F>(
  result: Result<T, E>,
  op: (error: E) => NonNullable<F>
): Result<T, F> | Result<T, E> {
  if (is_ok(result)) {
    return result;
  }

  return Err<F, T>(op(result.error));
}

export function and<T, E, U>(result: Result<T, E>, res: Result<U, E>): Result<U, E> | Result<T, E> {
  if (is_ok(result)) {
    return res;
  }

  return result;
}

export function and_then<T, E, U>(
  result: Result<T, E>,
  op: (value: T) => Result<U, E>
): Result<U, E> | Result<T, E> {
  if (is_ok(result)) {
    return op(result.value);
  }

  return result;
}

export function or<T, E, F>(result: Result<T, E>, res: Result<T, F>): Result<T, F> | Result<T, E> {
  if (is_ok(result)) {
    return result;
  }

  return res;
}

export function or_else<T, E, F>(
  result: Result<T, E>,
  op: (error: E) => Result<T, F>
): Result<T, F> | Result<T, E> {
  if (is_ok(result)) {
    return result;
  }

  return op(result.error);
}

export function unwrap_or<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (is_ok(result)) {
    return result.value;
  }

  return defaultValue;
}

export function unwrap_or_else<T, E>(result: Result<T, E>, op: (error: E) => T): T {
  if (is_ok(result)) {
    return result.value;
  }

  return op(result.error);
}

/**
 * @throws {Error} If is `Err`
 */
export function expect<T, E>(result: Result<T, E>, msg: string): T {
  if (is_ok(result)) {
    return result.value;
  }

  const errorMessage = result.error instanceof Error ? result.error.toString() : result.error;

  throw new Error(`${msg}: ${errorMessage}`);
}

/**
 * @throws {Error} If is `Err`
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (is_ok(result)) {
    return result.value;
  }

  if (result.error instanceof Error) {
    throw result.error;
  } else {
    throw new Error((result.error as any).toString());
  }
}

/**
 * @throws {Error} If is `Ok`
 */
export function expect_err<T, E>(result: Result<T, E>, msg: string): E {
  if (is_err(result)) {
    return result.error;
  }

  throw new Error(`${msg}: ${result.value}`);
}

/**
 * @throws {Error} If is `Ok`
 */
export function unwrap_err<T, E>(result: Result<T, E>): E {
  if (is_err(result)) {
    return result.error;
  }

  throw new Error(String(result.value));
}

export function toString<T, E>(result: Result<T, E>): string {
  const res =
    result.$typeof === 'Result::Ok'
      ? result.value
      : result.error instanceof Error
      ? result.error.message
      : result.error;

  return `${result.$typeof}(${JSON.stringify(res)})`;
}

export function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E> {
  if (is_ok(result)) {
    fn(result.value);
  }

  return result;
}

export function tap_err<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (is_err(result)) {
    fn(result.error);
  }

  return result;
}
