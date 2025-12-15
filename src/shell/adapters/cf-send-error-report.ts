import { createMimeMessage } from 'mimetext';

import type { ErrorReport, Config } from '../../core/types';
import { parseEmailAddress } from '../../core/parse-email-address';
import { EmailMessage } from 'cloudflare:email';

export const sendErrorReport = async ({
	config,
	rawMessage,
	notifier,
	reason,
	thrown,
}: ErrorReport & { config: Config; notifier: SendEmail }) => {
	const recipient = config.onError?.sendErrorReportTo;
	const recipientEmail = config.forwardAddresses.find((addr) => addr.name === recipient)?.email;
	const senderDomain = parseEmailAddress(rawMessage.from).domain;
	const senderEmail = `postmaster@${senderDomain}`;

	if (!recipientEmail) {
		return;
	}

	const error = thrown instanceof Error ? thrown : new Error(String(thrown));

	const msg = createMimeMessage();
	msg.setSender({ name: 'Cloudflare Email Sieve', addr: senderEmail });
	msg.setRecipient(recipientEmail);
	msg.setSubject('Error Report from Cloudflare Email Sieve');
	msg.setMessage(
		'text/plain',
		`
Error: ${reason}: ${error.message}
Stack Trace: ${error.stack}

Envelope:
From: ${rawMessage.from}
To: ${rawMessage.to}

Email Headers:
${Array.from(rawMessage.headers.entries())
	.map(([k, v]) => `${k}: ${v}`)
	.join('\n')}
            `,
	);

	const message = new EmailMessage(senderEmail, recipientEmail, msg.asRaw());

	try {
		await notifier.send(message);
	} catch (thrown: unknown) {
		console.error('Failed to send error report email', { thrown, recipientEmail, senderEmail });
	}
};
