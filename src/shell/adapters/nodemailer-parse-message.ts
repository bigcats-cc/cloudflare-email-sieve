import { Readable as NodeReadableStream } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import {
	MailParser,
	type AttachmentStream,
	type MessageText,
	type AddressObject as MailParserAddressObject,
	type Headers as MailParserHeaders,
	type HeaderValue as MailParserHeaderValue,
} from 'mailparser';
import { ExtractedMessage } from '../../core/types';
import { ExtractedMessageEmailAddress } from '../../core/types';

export const nodeMailerParseMessage = (messageStream: ReadableStream<Uint8Array<ArrayBufferLike>>): Promise<ExtractedMessage> => {
	const parser = new MailParser({
		skipImageLinks: true,
		skipTextToHtml: true,
		skipTextLinks: true,
	});
	const readableStream = _cfWorkerReadableStreamToNodeReadable(messageStream);
	readableStream.pipe(parser);

	let messageText: MessageText;
	let messageHeaders: MailParserHeaders;
	let hasAttachments: boolean = false;

	parser.on('headers', (headers: MailParserHeaders) => {
		messageHeaders = headers;
	});

	parser.on('data', (part: AttachmentStream | MessageText) => {
		switch (part.type) {
			case 'text':
				messageText = part;
				break;
			case 'attachment':
				hasAttachments = true;
				part.release();
				break;
			default:
				part satisfies never;
		}
	});

	const { promise, resolve } = Promise.withResolvers<ExtractedMessage>();

	parser.on('end', () => {
		resolve({
			body: {
				html: messageText.html && typeof messageText.html === 'string' ? messageText.html : '',
				text: messageText.text ?? '',
			},
			hasAttachments,
			from: _extractEmailAddresses(messageHeaders.get('from')),
			to: _extractEmailAddresses(messageHeaders.get('to')),
			cc: _extractEmailAddresses(messageHeaders.get('cc')),
			bcc: _extractEmailAddresses(messageHeaders.get('bcc')),
			replyTo: _extractEmailAddresses(messageHeaders.get('reply-to')),
		});
	});

	return promise;
};

const _cfWorkerReadableStreamToNodeReadable = (stream: ReadableStream<Uint8Array<ArrayBufferLike>>): NodeReadableStream => {
	return NodeReadableStream.fromWeb(stream as unknown as WebReadableStream);
};

const _extractEmailAddresses = (headerValue: MailParserHeaderValue | undefined): ExtractedMessageEmailAddress[] => {
	if (!_isEmailAddressHeaderValue(headerValue)) {
		return [];
	}

	const addresses = new Map<string, ExtractedMessageEmailAddress>();
	for (const addr of headerValue.value) {
		if (addr.address) {
			addresses.set(addr.address, {
				address: addr.address,
				name: addr.name ?? '',
			});
		} else if (addr.group) {
			for (const groupAddr of addr.group) {
				if (!groupAddr.address) {
					continue;
				}
				addresses.set(groupAddr.address, {
					address: groupAddr.address,
					name: groupAddr.name ?? '',
				});
			}
		}
	}

	return Array.from(addresses.values());
};

const _isEmailAddressHeaderValue = (header: MailParserHeaderValue | undefined): header is MailParserAddressObject =>
	header !== undefined && typeof header === 'object' && 'html' in header;
