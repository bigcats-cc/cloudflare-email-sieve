import type { EmailAddress } from './types';

const FALLBACK_EMAIL_ADDRESS = 'invalid@invalid';

export const parseEmailAddress = (email: string): EmailAddress => {
	try {
		return _parseEmailAddress(email);
	} catch {
		return _parseEmailAddress(FALLBACK_EMAIL_ADDRESS);
	}
};

const _parseEmailAddress = (email: string): EmailAddress => {
	const normalizedEmail = email.trim().normalize('NFC');

	const [displayNameOrEmail, maybeEmailWithEndChevron] = normalizedEmail.split('<', 2);

	const displayName = maybeEmailWithEndChevron ? displayNameOrEmail.trimEnd() : undefined;

	if (maybeEmailWithEndChevron && maybeEmailWithEndChevron.slice(-1) !== '>') {
		throw new Error(`Invalid email address format: missing closing '>' in "${email}"`);
	}

	const emailAddress = maybeEmailWithEndChevron ? maybeEmailWithEndChevron.slice(0, -1) : displayNameOrEmail;

	const [localPart, domain] = emailAddress.split('@', 2);

	if (!localPart || !domain) {
		throw new Error(`Invalid email address format: missing local part or domain in "${email}"`);
	}

	const [, plusAlias] = localPart.split('+', 2);

	return {
		emailAddress,
		localPart,
		domain,
		displayName,
		plusAlias,
	};
};
