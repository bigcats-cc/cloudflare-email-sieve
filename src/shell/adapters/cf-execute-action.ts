import type { ResolvedRuleAction, ActionableMessage } from '../../core/types';

export const executeAction = async (action: ResolvedRuleAction, message: ActionableMessage) => {
	switch (action.type) {
		case 'reject':
			message.setReject(action.message);
			return;

		case 'forward':
			for (const email of action.emails) {
				await message.forward(email);
			}
			return;

		default:
			action satisfies never;
	}
};
