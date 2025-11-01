import type { EnrichedMessage } from './message';
import type { UnwrapBrandedStringUnion } from './branded-string-union';

type StringOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'in';
type NumberOperator = 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
type BooleanOperator = 'equals';

type ArrayOperator = '$some' | '$every';

type DeepKeys<T> = T extends object
	? {
			[K in keyof T]-?: K extends string
				? NonNullable<T[K]> extends ReadableStream
					? never
					: NonNullable<T[K]> extends Array<infer U>
						? `${K}.${ArrayOperator}.${DeepKeys<U>}`
						: NonNullable<T[K]> extends string | number | boolean | Array<Record<string, any>>
							? `${K}`
							: NonNullable<T[K]> extends Record<string, any>
								? `${K}.${DeepKeys<T[K]>}`
								: never
				: never;
		}[keyof T]
	: never;

type GetTypeAtPath<T, Path extends string> = Path extends keyof T
	? T[Path]
	: Path extends `${infer First}.${infer Rest}`
		? First extends keyof T
			? T[First] extends Array<infer U>
				? Rest extends `${ArrayOperator}.${infer AfterOp}`
					? GetTypeAtPath<U, AfterOp>
					: never
				: GetTypeAtPath<T[First], Rest>
			: never
		: never;

type GetTypeAtPathUnwrapped<T, TPath extends string> = UnwrapBrandedStringUnion<NonNullable<GetTypeAtPath<T, TPath>>>;

type OperatorFor<T> = T extends string ? StringOperator : T extends number ? NumberOperator : T extends boolean ? BooleanOperator : never;

type ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator> = [TTypeAtPath] extends [string]
	? TOperator extends 'matches'
		? RegExp
		: TOperator extends 'in'
			? TTypeAtPath[]
			: TTypeAtPath
	: [TTypeAtPath] extends [number]
		? TOperator extends 'in'
			? TTypeAtPath[]
			: TTypeAtPath
		: [TTypeAtPath] extends [boolean]
			? TTypeAtPath
			: never;

export type Condition<
	T = EnrichedMessage,
	TPath extends DeepKeys<T> = DeepKeys<T>,
	TTypeAtPath extends GetTypeAtPathUnwrapped<T, TPath> = GetTypeAtPathUnwrapped<T, TPath>,
	TOperator extends OperatorFor<TTypeAtPath> = OperatorFor<TTypeAtPath>,
	TValueType extends ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator> = ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator>,
> =
	| SimpleCondition<T, TPath, TTypeAtPath, TOperator, TValueType>
	| ['$and', ...Condition<T>[]]
	| ['$or', ...Condition<T>[]]
	| ['$not', Condition<T>]
	| ((obj: T) => boolean);

export type SimpleCondition<
	T = EnrichedMessage,
	TPath extends DeepKeys<T> = DeepKeys<T>,
	TTypeAtPath extends GetTypeAtPathUnwrapped<T, TPath> = GetTypeAtPathUnwrapped<T, TPath>,
	TOperator extends OperatorFor<TTypeAtPath> = OperatorFor<TTypeAtPath>,
	TValueType extends ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator> = ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator>,
> = [TPath, TOperator, NoInfer<TValueType>];

export type ConditionFunction = <
	TPath extends DeepKeys<EnrichedMessage>,
	TTypeAtPath extends GetTypeAtPathUnwrapped<EnrichedMessage, TPath>,
	TOperator extends OperatorFor<TTypeAtPath>,
	TValueType extends ValueTypeForTypeAtPathAndOperator<TTypeAtPath, TOperator>,
>(
	path: TPath,
	operator: TOperator,
	value: NoInfer<TValueType>,
) => Condition<EnrichedMessage>;

export type AggregateConditionFunction = <T>(...rules: Condition<T>[]) => Condition<T>;
