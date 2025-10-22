import type { EmailAddress } from './types';

export const parseEmailAddress = (email: string): EmailAddress => {
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
