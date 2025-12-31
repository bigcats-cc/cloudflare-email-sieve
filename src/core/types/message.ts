import type { BrandedStringUnion } from './branded-string-union';

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
	from: EmailAddress[];
	to: EmailAddress[];
	cc: EmailAddress[];
	bcc: EmailAddress[];
	replyTo?: EmailAddress[];
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
		text: string;
		html: string;
	};
	headers: Headers;
}>;

export type ActionableMessage = Readonly<Pick<ForwardableEmailMessage, 'forward' | 'setReject'>>;
