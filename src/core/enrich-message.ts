import { splitEmailAddress } from './split-email-address';
import type { SimpleMessage, EnrichedMessage } from './types';

export const enrichMessage = (message: SimpleMessage): EnrichedMessage => {
	const from = splitEmailAddress(message.from);
	const to = splitEmailAddress(message.to);

	return {
		...message,
		to: to.full,
		'to.localPart': to.localPart,
		'to.domain': to.domain,
		from: from.full,
		'from.localPart': from.localPart,
		'from.domain': from.domain,
		subject: message.headers.get('Subject') ?? undefined,
		cc: message.headers.get('Cc') ?? undefined,
		bcc: message.headers.get('Bcc') ?? undefined,
		replyTo: message.headers.get('Reply-To') ?? undefined,
	};
};
