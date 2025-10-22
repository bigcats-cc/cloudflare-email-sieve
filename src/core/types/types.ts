type NonEmptyArray<T> = readonly [T, ...T[]];
type ExactlyOneProperty<T> = T extends undefined
	? {}
	: {
			[K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never };
		}[keyof T];

declare const StringUnionBrand: unique symbol;
type StringUnionBrand = typeof StringUnionBrand;
type BrandedStringUnion<T extends string> = T & { [StringUnionBrand]: true };

export type SimpleMessage = Readonly<Pick<ForwardableEmailMessage, 'from' | 'to' | 'headers' | 'raw' | 'rawSize'>>;

export type EmailAddress = Readonly<{
	displayName?: string;
	emailAddress: string;
	localPart: string;
	plusAlias?: string;
	domain: string;
}>;

export type AuthenticationResult = BrandedStringUnion<'pass' | 'fail' | 'no-result'>;

export type Importance = BrandedStringUnion<'high' | 'normal' | 'low'>;

export type EnrichedMessage = Readonly<{
	envelope: {
		from: EmailAddress;
		to: EmailAddress;
	};
	from?: EmailAddress[];
	to?: EmailAddress[];
	cc?: EmailAddress[];
	bcc?: EmailAddress[];
	replyTo?: EmailAddress;
	importance?: Importance;
	subject?: string;
	hasAttachments: boolean;
	isMailingList: boolean;
	isAutoSubmitted: boolean;
	authentication: {
		dkim: AuthenticationResult;
		spf: AuthenticationResult;
		dmarc: AuthenticationResult;
	};
	isReply?: boolean;
	body: {
		raw: ReadableStream<Uint8Array>;
		rawSize: number;
	};
	headers: Headers;
}>;

type StringMatcher<TValue extends string> =
	| { $contains: TValue }
	| { $equals: TValue }
	| { $startsWith: TValue }
	| { $endsWith: TValue }
	| { $in: NonEmptyArray<TValue> }
	| { $matches: RegExp };

type NumberMatcher<TValue extends number> =
	| { $equals: TValue }
	| { $gt: TValue }
	| { $gte: TValue }
	| { $lt: TValue }
	| { $lte: TValue }
	| { $in: NonEmptyArray<TValue> };

type SimpleMatcher<TValue> = { $equals: TValue };

type HeadersMatcher = ExactlyOneProperty<{
	[k: string]: SimpleCondition<string> | SimpleCondition<undefined>;
}>;

type ArrayMatcher<TValue> = { $every: SimpleCondition<TValue> } | { $some: SimpleCondition<TValue> };

type RecordMatcher<TValue extends Record<any, any>> = ExactlyOneProperty<{
	[TKey in keyof TValue]: SimpleCondition<TValue[TKey]>;
}>;

type UndefinedMatcher = { $equals: undefined };

export type SimpleCondition<TValue extends unknown = EnrichedMessage> = Exclude<
	TValue extends BrandedStringUnion<infer TInner>
		? SimpleMatcher<TInner>
		: TValue extends Headers
			? HeadersMatcher
			: TValue extends Array<infer TInnerValue>
				? ArrayMatcher<TInnerValue>
				: TValue extends Record<any, any>
					? RecordMatcher<TValue>
					: TValue extends boolean
						? SimpleMatcher<TValue>
						: TValue extends string
							? StringMatcher<TValue>
							: TValue extends number
								? NumberMatcher<TValue>
								: TValue extends undefined
									? UndefinedMatcher
									: undefined,
	undefined
>;

type ConditionAnd = { $and: NonEmptyArray<ConditionGroup> };
type ConditionOr = { $or: NonEmptyArray<ConditionGroup> };
type ConditionNot = { $not: ConditionGroup };

export type ConditionGroup = SimpleCondition | ConditionAnd | ConditionOr | ConditionNot;
type ConditionFunction = (message: EnrichedMessage) => boolean;
export type Condition = ConditionGroup | ConditionFunction;

export type ActionableMessage = Readonly<Pick<ForwardableEmailMessage, 'forward' | 'setReject'>>;

export type Rule<TForwardAddressName extends string = string> = {
	condition?: Condition;
} & ({ forwardTo: NonEmptyArray<NoInfer<TForwardAddressName>> } | { reject: string });

export type Config<TForwardAddressName extends string = string> = {
	forwardAddresses: NonEmptyArray<{ name: TForwardAddressName; email: string }>;
	rules: NonEmptyArray<Rule<NoInfer<TForwardAddressName>>>;
};

export type ResolvedRuleAction = { type: 'reject'; message: string } | { type: 'forward'; emails: string[] };
