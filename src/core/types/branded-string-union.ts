declare const StringUnionBrand: unique symbol;
type StringUnionBrand = typeof StringUnionBrand;

export type BrandedStringUnion<T extends string> = T & { [StringUnionBrand]: true };

export type UnwrapBrandedStringUnion<T> = T extends BrandedStringUnion<infer U> ? U : T;
