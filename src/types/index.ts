// See https://stackoverflow.com/questions/41980195/recursive-partialt-in-typescript-2-1
// See https://github.com/Microsoft/TypeScript/issues/12424
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
