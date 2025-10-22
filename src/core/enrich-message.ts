import { parseEmailAddress } from './parse-email-address';
import type { SimpleMessage, EnrichedMessage, Importance, AuthenticationResult } from './types';

export const enrichMessage = (message: SimpleMessage): EnrichedMessage => ({
	envelope: {
		from: parseEmailAddress(message.from),
		to: parseEmailAddress(message.to),
	},
	from: _splitCsv(message.headers.get('From') ?? '').map(parseEmailAddress),
	to: _splitCsv(message.headers.get('To') ?? '').map(parseEmailAddress),
	cc: _splitCsv(message.headers.get('Cc') ?? '').map(parseEmailAddress),
	bcc: _splitCsv(message.headers.get('Bcc') ?? '').map(parseEmailAddress),
	replyTo: message.headers.has('Reply-To') ? parseEmailAddress(message.headers.get('Reply-To')!) : undefined,
	importance: ['high', 'normal', 'low'].includes(message.headers.get('Importance')?.toLowerCase() ?? '')
		? (message.headers.get('Importance')?.toLowerCase() as Importance)
		: undefined,
	subject: message.headers.get('Subject') ?? undefined,
	hasAttachments: message.headers.has('Content-Disposition') && /attachment/i.test(message.headers.get('Content-Disposition')!),
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
	body: {
		raw: message.raw,
		rawSize: message.rawSize,
	},
	isReply: (message.headers.get('In-Reply-To') ?? message.headers.get('References')) !== undefined,
});

const _splitCsv = (str: string): string[] =>
	str.split(',').flatMap((part) => {
		const trimmed = part.trim();
		return trimmed.length > 0 ? [trimmed] : [];
	});
