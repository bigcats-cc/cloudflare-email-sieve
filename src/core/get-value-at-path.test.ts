import { it, describe, expect } from 'vitest';
import { getValueAtPath } from './get-value-at-path';

describe.concurrent('getValueAtPath', () => {
	const testObj = {
		foo: {
			bar: [
				{
					baz: 42,
				},
				{
					baz: 100,
				},
			],
			qux: 'hello',
		},
		corge: [1, 2, 3],
		grault: 'world',
	};

	it('should get foo.bar', () => {
		// Act
		const result = getValueAtPath(testObj, 'foo.bar');

		// Assert
		expect(result).toStrictEqual([{ baz: 42 }, { baz: 100 }]);
	});

	it('should get foo.bar.1.baz', () => {
		// Act
		const result = getValueAtPath(testObj, 'foo.bar.1.baz');

		// Assert
		expect(result).toBe(100);
	});

	it('should get corge', () => {
		// Act
		const result = getValueAtPath(testObj, 'corge');

		// Assert
		expect(result).toStrictEqual([1, 2, 3]);
	});

	it('should get grault', () => {
		// Act
		const result = getValueAtPath(testObj, 'grault');

		// Assert
		expect(result).toStrictEqual('world');
	});

	it('should return undefined for non-existing path', () => {
		// Act
		const result = getValueAtPath(testObj, 'foo.nonExisting.bar');

		// Assert
		expect(result).toBeUndefined();
	});
});
