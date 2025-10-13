import type { ConditionGroup, EnrichedMessage } from './types';

export const messageSatisfiesCondition = (condition: ConditionGroup, message: EnrichedMessage): boolean => {
	switch (true) {
		case typeof condition === 'function':
			return condition(message);

		case Array.isArray(condition):
			const [field, operator, value] = condition;
			const fieldValue = message[field] ?? '';

			switch (operator) {
				case 'contains':
					return fieldValue.includes(value);
				case 'equals':
					return fieldValue === value;
				case 'startsWith':
					return fieldValue.startsWith(value);
				case 'endsWith':
					return fieldValue.endsWith(value);
				case 'in':
					return value.includes(fieldValue);
				case 'matches':
					return new RegExp(value).test(fieldValue);
				default:
					operator satisfies never;
			}
			return false;

		case 'and' in condition:
			return condition.and.every((c) => messageSatisfiesCondition(c, message));

		case 'or' in condition:
			return condition.or.some((c) => messageSatisfiesCondition(c, message));

		case 'not' in condition:
			return !messageSatisfiesCondition(condition.not, message);

		default:
			condition satisfies never;
	}

	return false;
};
