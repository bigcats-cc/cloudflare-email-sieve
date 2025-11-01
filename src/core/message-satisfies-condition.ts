import { getValueAtPath } from './get-value-at-path';
import type { Condition, SimpleCondition, EnrichedMessage } from './types';

export const messageSatisfiesCondition = (condition: Condition, message: EnrichedMessage): boolean => {
	if (typeof condition === 'function') {
		return condition(message);
	}

	const [first, ...rest] = condition;
	const conditions = rest as Condition[];

	switch (first) {
		case '$and':
			return conditions.every((cond) => messageSatisfiesCondition(cond, message));
		case '$or':
			return conditions.some((cond) => messageSatisfiesCondition(cond, message));
		case '$not':
			return !messageSatisfiesCondition(condition[1], message);
		default:
			return _messageSatisfiesSimpleCondition(condition, message);
	}
};

const _messageSatisfiesSimpleCondition = <T>(condition: SimpleCondition<T>, message: T): boolean => {
	const [path, operator, expectedValue] = condition;
	const splitPath = path.split('.');
	const someIndex = splitPath.indexOf('$some');
	const everyIndex = splitPath.indexOf('$every');

	if (someIndex > 0 || everyIndex > 0) {
		const arrayPath = someIndex > 0 ? splitPath.slice(0, someIndex).join('.') : splitPath.slice(0, everyIndex).join('.');
		const restPath = someIndex > 0 ? splitPath.slice(someIndex + 1).join('.') : splitPath.slice(everyIndex + 1).join('.');
		const array: any = getValueAtPath(message, arrayPath);

		if (!Array.isArray(array)) {
			return false;
		}

		const compareFn = (item: any) => _messageSatisfiesSimpleCondition([restPath, operator, expectedValue], item);

		return someIndex > 0 ? array.some(compareFn) : array.every(compareFn);
	}

	const actualValue = getValueAtPath(message, path);

	switch (operator) {
		case 'equals':
			return actualValue === expectedValue;
		case 'in':
			if (!Array.isArray(expectedValue)) {
				throw new Error(`'in' operator requires the expected value to be an array.`);
			}
			return (expectedValue as any[]).includes(actualValue);
		case 'contains':
			if (typeof actualValue !== 'string' || typeof expectedValue !== 'string') {
				throw new Error(`'contains' operator can only be used with string values.`);
			}
			return actualValue.includes(expectedValue);
		case 'startsWith':
			if (typeof actualValue !== 'string' || typeof expectedValue !== 'string') {
				throw new Error(`'startsWith' operator can only be used with string values.`);
			}
			return actualValue.startsWith(expectedValue);
		case 'endsWith':
			if (typeof actualValue !== 'string' || typeof expectedValue !== 'string') {
				throw new Error(`'endsWith' operator can only be used with string values.`);
			}
			return actualValue.endsWith(expectedValue);
		case 'matches':
			if (typeof actualValue !== 'string' || !(expectedValue instanceof RegExp)) {
				throw new Error(`'matches' operator requires a string actual value and a RegExp expected value.`);
			}
			return new RegExp(expectedValue).test(actualValue);
		case 'gt':
			return actualValue > expectedValue;
		case 'gte':
			return actualValue >= expectedValue;
		case 'lt':
			return actualValue < expectedValue;
		case 'lte':
			return actualValue <= expectedValue;
		default:
			return operator satisfies never;
	}
};
