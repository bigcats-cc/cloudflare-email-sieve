import { messageSatisfiesCondition } from './message-satisfies-condition';
import type { Rule, Config, ResolvedRuleAction, EnrichedMessage } from './types';

export const determineActionFromMessageRules = (message: EnrichedMessage, config: Config<string>): ResolvedRuleAction => {
	for (const rule of config.rules) {
		if (!rule.when || messageSatisfiesCondition(rule.when, message)) {
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
		case 'rejectWithReason' in rule:
			return { type: 'reject', message: rule.rejectWithReason };

		case 'forwardTo' in rule:
			const emails = rule.forwardTo
				.map((name) => config.forwardAddresses.find((a) => a.name === name)?.email)
				.filter((email): email is string => email !== undefined);

			return { type: 'forward', emails };

		default:
			return rule satisfies never;
	}
};
