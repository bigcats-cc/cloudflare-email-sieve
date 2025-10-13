type NonEmptyArray<T> = readonly [T, ...T[]];

export type SimpleMessage = Readonly<Pick<ForwardableEmailMessage, 'from' | 'to' | 'headers' | 'raw' | 'rawSize'>>;

export type EnrichedMessage = Readonly<
	Pick<ForwardableEmailMessage, 'from' | 'to' | 'headers' | 'raw' | 'rawSize'> & {
		'from.localPart': string;
		'from.domain': string;
		'to.localPart': string;
		'to.domain': string;
		subject?: string;
		cc?: string;
		bcc?: string;
		replyTo?: string;
	}
>;
export type ActionableMessage = Pick<ForwardableEmailMessage, 'forward' | 'setReject'>;

type MessageField = Exclude<Extract<keyof EnrichedMessage, string>, 'headers' | 'raw' | 'rawSize'>;
type StringOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';
type RegexOperator = 'matches';
type ArrayOperator = 'in';
type Condition =
	| [MessageField, StringOperator, string]
	| [MessageField, ArrayOperator, NonEmptyArray<string>]
	| [MessageField, RegexOperator, RegExp]
	| ((message: EnrichedMessage) => boolean);

type ConditionAnd = { and: NonEmptyArray<ConditionGroup> };
type ConditionOr = { or: NonEmptyArray<ConditionGroup> };
type ConditionNot = { not: ConditionGroup };

export type ConditionGroup = Condition | ConditionAnd | ConditionOr | ConditionNot;

export type Rule<TForwardAddressName extends string = string> = {
	condition?: ConditionGroup;
} & ({ forwardTo: NonEmptyArray<NoInfer<TForwardAddressName>> } | { reject: string });

export type Config<TForwardAddressName extends string = string> = {
	forwardAddresses: NonEmptyArray<{ name: TForwardAddressName; email: string }>;
	rules: NonEmptyArray<Rule<NoInfer<TForwardAddressName>>>;
};

export type ResolvedRuleAction = { type: 'reject'; message: string } | { type: 'forward'; emails: string[] };
