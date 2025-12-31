export type ExtractedMessageEmailAddress = {
	address: string;
	name: string;
};

export type ExtractedMessage = {
	body: { html: string; text: string };
	hasAttachments: boolean;
	from?: ExtractedMessageEmailAddress[];
	to?: ExtractedMessageEmailAddress[];
	cc?: ExtractedMessageEmailAddress[];
	bcc?: ExtractedMessageEmailAddress[];
	replyTo?: ExtractedMessageEmailAddress[];
};
