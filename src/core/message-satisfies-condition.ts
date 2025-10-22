import type { Condition, SimpleCondition, EnrichedMessage } from './types';

export const messageSatisfiesCondition = (condition: Condition, message: EnrichedMessage): boolean => {
	switch (true) {
		case typeof condition === 'function':
			return condition(message);
		case '$and' in condition:
			return condition.$and.every((cond) => messageSatisfiesCondition(cond, message));
		case '$or' in condition:
			return condition.$or.some((cond) => messageSatisfiesCondition(cond, message));
		case '$not' in condition:
			return !messageSatisfiesCondition(condition.$not, message);
		default:
			condition;
	}

	// Find the property being evaluated:
	const [propertyName, propertyCondition] = Object.entries(condition)[0]
	const propertyValue = message[propertyName as keyof EnrichedMessage]!;

	return _valueSatisfiesCondition(propertyCondition, propertyValue);
};

/**
 * Evaluates a value against a specific condition
 */
const _valueSatisfiesCondition = <T extends unknown>(condition: SimpleCondition<T>, propertyValue: T): boolean => {
	switch (true) {
		// BooleanMatcher:
		case typeof propertyValue === 'boolean':
			const booleanCondition = condition as SimpleCondition<boolean>
			switch(true) {
				case '$equals' in booleanCondition:
					return propertyValue === booleanCondition.$equals
				default:
					return booleanCondition satisfies never
			}
		// UndefinedMatcher:
		case propertyValue === undefined:
			const undefinedCondition = condition as SimpleCondition<undefined>
			switch(true) {
				case '$equals' in undefinedCondition:
					return propertyValue === undefinedCondition.$equals
				default:
					return undefinedCondition satisfies never
			}
		// StringMatcher:
		case typeof propertyValue === 'string':
			const stringCondition = condition as SimpleCondition<string>;
			switch (true) {
				case '$equals' in stringCondition:
					return stringCondition.$equals === propertyValue;
				case '$contains' in stringCondition:
					return propertyValue.includes(stringCondition.$contains);
				case '$startsWith' in stringCondition:
					return propertyValue.startsWith(stringCondition.$startsWith);
				case '$endsWith' in stringCondition:
					return propertyValue.endsWith(stringCondition.$endsWith);
				case '$matches' in stringCondition:
					return new RegExp(stringCondition.$matches).test(propertyValue);
				case '$in' in stringCondition:
					return stringCondition.$in.includes(propertyValue);
				default:
					return stringCondition satisfies never;
			}
		// NumberMatcher:
		case typeof propertyValue === 'number':
			const numberCondition = condition as SimpleCondition<number>;
			switch (true) {
				case '$equals' in numberCondition:
					return numberCondition.$equals === propertyValue;
				case '$in' in numberCondition:
					return numberCondition.$in.includes(propertyValue);
				case '$gt' in numberCondition:
					return propertyValue > numberCondition.$gt;
				case '$gte' in numberCondition:
					return propertyValue >= numberCondition.$gte;
				case '$lt' in numberCondition:
					return propertyValue > numberCondition.$lt;
				case '$lte' in numberCondition:
					return propertyValue >= numberCondition.$lte;
				default:
					return numberCondition satisfies never;
			}
		// HeadersMatcher:
		case propertyValue instanceof Headers:
			const headersCondition = condition as SimpleCondition<Headers>
			const [headerName, headerCondition] = Object.entries(headersCondition)[0] as [string, SimpleCondition<string>|SimpleCondition<undefined>]
			const headerValue = propertyValue.get(headerName) ?? undefined

			switch(true){
				case '$equals' in headerCondition:
					return headerValue === headerCondition.$equals
				case '$startsWith' in headerCondition:
					return headerValue?.startsWith(headerCondition.$startsWith) ?? false
				case '$endsWith' in headerCondition:
					return headerValue?.endsWith(headerCondition.$endsWith) ?? false
				case '$contains' in headerCondition:
					return headerValue?.includes(headerCondition.$contains) ?? false
				case '$matches' in headerCondition:
					return headerValue !== undefined ? new RegExp(headerCondition.$matches).test(headerValue) : false
				case '$in' in headerCondition:
					return headerValue !== undefined ? headerCondition.$in.includes(headerValue): false
				default:
					return headerCondition satisfies never
			}
		// ArrayMatcher:
		case Array.isArray(propertyValue):
			const arrayCondition = condition as SimpleCondition<unknown[]>;
			switch (true) {
				case '$some' in arrayCondition:
					return propertyValue.some((v) => _valueSatisfiesCondition(arrayCondition.$some, propertyValue));
				case '$every' in arrayCondition:
					return propertyValue.every((v) => _valueSatisfiesCondition(arrayCondition.$every, propertyValue));
				default:
					return arrayCondition satisfies never;
			}
		// RecordsMatcher:
		case (typeof propertyValue === 'object' && propertyValue && propertyValue.constructor === Object):
			const recordCondition = condition as SimpleCondition<Record<any, any>>
			const [recordPropName, recordPropCondition] = Object.entries(recordCondition)[0] as [string, SimpleCondition<unknown>]
			const recordPropValue = Reflect.get(propertyValue, recordPropName) ?? undefined

			return _valueSatisfiesCondition(recordPropCondition, recordPropValue)
		default:
			return false;
	}

	/*
	// Handle boolean matchers
	if (typeof value === 'boolean' && '$equals' in condition) {
		return value === condition.$equals;
	}

	// Handle undefined matcher
	if (value === undefined && '$equals' in condition && condition.$equals === undefined) {
		return true;
	}

	// Handle branded string unions
	if (typeof value === 'string' && '$equals' in condition) {
		return value === condition.$equals;
	}

	// Handle array matchers
	if (Array.isArray(value)) {
		if ('$some' in condition) {
			return value.some((item) => _valueSatisfiesCondition(condition.$some, item));
		}
		if ('$every' in condition) {
			return value.length > 0 && value.every((item) => _valueSatisfiesCondition(condition.$every, item));
		}
	}

	// Handle Headers matcher
	if (value instanceof Headers) {
		const headerKey = Object.keys(condition)[0];
		const headerCondition = condition[headerKey as keyof typeof condition];
		const headerValue = value.get(headerKey);
		return _valueSatisfiesCondition(headerCondition, headerValue);
	}

	// Handle record matchers (objects)
	if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Headers)) {
		const recordKey = Object.keys(condition)[0];
		if (recordKey in value) {
			const recordCondition = condition[recordKey as keyof typeof condition];
			const recordValue = (value as any)[recordKey];
			return _valueSatisfiesCondition(recordCondition, recordValue);
		}
		return false;
	}

	// Handle string matchers
	if (typeof value === 'string') {
		if ('$contains' in condition && typeof condition.$contains === 'string') {
			return value.includes(condition.$contains);
		}
		if ('$equals' in condition) {
			return value === condition.$equals;
		}
		if ('$startsWith' in condition && typeof condition.$startsWith === 'string') {
			return value.startsWith(condition.$startsWith);
		}
		if ('$endsWith' in condition && typeof condition.$endsWith === 'string') {
			return value.endsWith(condition.$endsWith);
		}
		if ('$in' in condition && Array.isArray(condition.$in)) {
			return condition.$in.includes(value);
		}
		if ('$matches' in condition && condition.$matches instanceof RegExp) {
			return condition.$matches.test(value);
		}
	}

	// Handle number matchers
	if (typeof value === 'number') {
		if ('$equals' in condition) {
			return value === condition.$equals;
		}
		if ('$gt' in condition && typeof condition.$gt === 'number') {
			return value > condition.$gt;
		}
		if ('$gte' in condition && typeof condition.$gte === 'number') {
			return value >= condition.$gte;
		}
		if ('$lt' in condition && typeof condition.$lt === 'number') {
			return value < condition.$lt;
		}
		if ('$lte' in condition && typeof condition.$lte === 'number') {
			return value <= condition.$lte;
		}
		if ('$in' in condition && Array.isArray(condition.$in)) {
			return condition.$in.includes(value);
		}
	}

	return false;
	*/
};
