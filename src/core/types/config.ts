import type { Condition } from './condition';

type NonEmptyArray<T> = readonly [T, ...T[]];

export type Rule<TForwardAddressName extends string = string> = {
	when?: Condition;
} & ({ forwardTo: NonEmptyArray<NoInfer<TForwardAddressName>> } | { rejectWithReason: string });

export type Config<TForwardAddressName extends string = string> = {
	forwardAddresses: NonEmptyArray<{ name: TForwardAddressName; email: string }>;
	rules: NonEmptyArray<Rule<NoInfer<TForwardAddressName>>>;
};

export type ResolvedRuleAction = { type: 'reject'; message: string } | { type: 'forward'; emails: string[] };
