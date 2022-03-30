import * as Num from "fp-ts/number";
import * as O from "fp-ts/Option";
import * as Str from "fp-ts/string";

export * as A from "fp-ts/Array";
export { flow, pipe } from "fp-ts/function";
export * as NEA from "fp-ts/NonEmptyArray";
export * as O from "fp-ts/Option";
export * as Re from "fp-ts/Record";
export * as S from "fp-ts/string";

export const OAlt = {
  numberFromUnknown: O.fromPredicate(Num.isNumber),
  stringFromUnknown: O.fromPredicate(Str.isString),
};
