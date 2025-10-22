import { assertType, expectTypeOf, it, describe } from 'vitest';
import type * as types from './types';

type AssertExtends<_A extends B, B> = true;
type AssertNotExtends<A, B> = A extends B ? false : true;
type AssertTrue<_T extends true> = true;
type AssertAll<_T extends true[]> = true;
