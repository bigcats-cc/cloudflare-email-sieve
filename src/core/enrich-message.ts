import { parseEmailAddress } from './parse-email-address';
import type {
	SimpleMessage,
	EnrichedMessage,
	Importance,
	AuthenticationResult,
	ExtractedMessage,
	ExtractedMessageEmailAddress,
} from './types';

export const enrichMessage = (message: SimpleMessage, extractedMessage: ExtractedMessage): EnrichedMessage => ({
	envelope: {
		from: parseEmailAddress(message.from),
		to: parseEmailAddress(message.to),
	},
	from: _mapEmailAddresses(extractedMessage.from),
	to: _mapEmailAddresses(extractedMessage.to),
	cc: _mapEmailAddresses(extractedMessage.cc),
	bcc: _mapEmailAddresses(extractedMessage.bcc),
	replyTo: _mapEmailAddresses(extractedMessage.replyTo),
	importance: ['high', 'normal', 'low'].includes(message.headers.get('Importance')?.toLowerCase() ?? '')
		? (message.headers.get('Importance')?.toLowerCase() as Importance)
		: undefined,
	subject: message.headers.get('Subject') ?? undefined,
	hasAttachments: extractedMessage.hasAttachments,
	isMailingList: message.headers.has('List-Id') || message.headers.has('List-Unsubscribe'),
	isAutoSubmitted: (message.headers.get('Auto-Submitted')?.toLowerCase() ?? 'no') !== 'no',
	authentication: {
		dkim: (message.headers.get('Authentication-Results')?.includes('dkim=pass')
			? 'pass'
			: message.headers.get('Authentication-Results')?.includes('dkim=fail')
				? 'fail'
				: 'no-result') as AuthenticationResult,
		spf: (message.headers.get('Authentication-Results')?.includes('spf=pass')
			? 'pass'
			: message.headers.get('Authentication-Results')?.includes('spf=fail')
				? 'fail'
				: 'no-result') as AuthenticationResult,
		dmarc: (message.headers.get('Authentication-Results')?.includes('dmarc=pass')
			? 'pass'
			: message.headers.get('Authentication-Results')?.includes('dmarc=fail')
				? 'fail'
				: 'no-result') as AuthenticationResult,
	},
	headers: message.headers,
	body: extractedMessage.body,
	isReply: (message.headers.get('In-Reply-To') ?? message.headers.get('References')) !== undefined,
});

const _mapEmailAddresses = (addresses: ExtractedMessageEmailAddress[] | undefined) =>
	addresses?.map((email) => ({ ...parseEmailAddress(email.address), displayName: email.name })) ?? [];
