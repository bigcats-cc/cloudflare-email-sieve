import { defineConfig, field, not, or, and } from '../core/define-config';

export const config = defineConfig({
	forwardAddresses: [{ name: 'carter', email: 'samantha.carter@sg1.airforce.mil' }],
	rules: [
		{
			when: or(
				field('subject', 'matches', /urgent/i),
				field('importance', 'equals', 'high'),
				field('envelope.from.localPart', 'contains', 'hammond'),
			),
			forwardTo: ['carter'],
		},
		{
			rejectWithReason: 'This mailbox only accepts urgent messages or those from General Hammond.',
		},
	],
});
