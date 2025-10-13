import type { ResolvedRuleAction, ActionableMessage } from '../../core/types';

export const executeAction = async (action: ResolvedRuleAction, message: ActionableMessage): Promise<void> => {
	switch (action.type) {
		case 'reject':
			message.setReject(action.message);
			return;

		case 'forward':
			await Promise.allSettled(action.emails.map((email) => message.forward(email)));
			return;

		default:
			action satisfies never;
	}
};
