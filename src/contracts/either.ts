export type Either<L, R> =
  | { type: 'left'; value: L }
  | { type: 'right'; value: R };
