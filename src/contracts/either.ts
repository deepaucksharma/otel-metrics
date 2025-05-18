/**
 * @file src/contracts/either.ts
 * @summary either module
 * @layer Contracts
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
export type Either<L, R> =
  | { type: 'left'; value: L }
  | { type: 'right'; value: R };
