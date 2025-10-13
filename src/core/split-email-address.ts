export const splitEmailAddress = (email: string): { localPart: string; domain: string; full: string } => {
	const raw = email.trim();

	const lt = raw.indexOf('<');
	const gt = raw.lastIndexOf('>');
	const address = lt !== -1 && gt > lt ? raw.slice(lt + 1, gt).trim() : raw;

	const normalized = address.normalize('NFC');
	const atIndex = normalized.lastIndexOf('@');

	if (atIndex <= 0 || atIndex === normalized.length - 1) {
		throw new Error(`Invalid email address: ${address}`);
	}

	const localPart = normalized.slice(0, atIndex);
	let domain = normalized.slice(atIndex + 1).toLowerCase();
	const full = `${localPart}@${domain}`;

	return { localPart, domain, full };
};
