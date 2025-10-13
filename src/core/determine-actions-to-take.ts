import { messageSatisfiesCondition } from './message-satisfies-condition';
import type { Rule, Config, ResolvedRuleAction, SimpleMessage } from './types';

export const determineActionFromMessageRules = (message: SimpleMessage, config: Config<string>): ResolvedRuleAction => {
	for (const rule of config.rules) {
		if (!rule.condition || messageSatisfiesCondition(rule.condition, message)) {
			return _getRuleAction(rule, config);
		}
	}
	return { type: 'reject', message: 'Undeliverable' };
};

const _getRuleAction = <TForwardAddressName extends string>(
	rule: Rule<TForwardAddressName>,
	config: Config<TForwardAddressName>,
): ResolvedRuleAction => {
	switch (true) {
		case 'reject' in rule:
			return { type: 'reject', message: rule.reject };

		case 'forwardTo' in rule:
			const emails = rule.forwardTo
				.map((name) => config.forwardAddresses.find((a) => a.name === name)?.email)
				.filter((email): email is string => email !== undefined);

			return { type: 'forward', emails };

		default:
			return rule satisfies never;
	}
};
