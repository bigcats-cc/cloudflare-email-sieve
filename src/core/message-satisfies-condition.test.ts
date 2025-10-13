import { it, describe, expect } from 'vitest';
import { messageSatisfiesCondition } from './message-satisfies-condition';
import type { EnrichedMessage } from './types';
import { enrichMessage } from './enrich-message';

const _mockMessage = (props: Partial<EnrichedMessage> = {}): EnrichedMessage => ({
	...enrichMessage({
		from: 'a@b.com',
		to: 'a@b.com',
		headers: new Headers(),
		raw: new ReadableStream(),
		rawSize: 0,
		...props,
	}),
	...props,
});

describe.concurrent('messageSatisfiesCondition', () => {
	describe.concurrent('with function condition', () => {
		it('returns true when function returns true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(({ to }) => to === 'foo@bar.com', message);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when function returns false', () => {
			// Arrange
			const message = _mockMessage({ to: 'bar@foo.com' });

			// Act
			const result = messageSatisfiesCondition(({ to }) => to === 'foo@bar.com', message);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with simple condition', () => {
		describe.concurrent('field value contains string', () => {
			it('returns true when field value contains string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'contains', 'bar.com'], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not contain string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'contains', 'baz.com'], message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value equals string', () => {
			it('returns true when field value equals string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'equals', 'foo@bar.com'], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not equal string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'equals', 'bar@foo.com'], message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value starts with string', () => {
			it('returns true when field value starts with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'startsWith', 'foo'], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not start with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'startsWith', 'bar'], message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value ends with string', () => {
			it('returns true when field value ends with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'endsWith', 'bar.com'], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not end with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'endsWith', 'baz.com'], message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value in array', () => {
			it('returns true when field value is in array', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'in', ['foo@bar.com']], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value is not in array', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'in', ['bar@foo.com']], message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value matches regex', () => {
			it('returns true when field value matches regex', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'matches', /^.*@bar.com$/], message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not match regex', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });

				// Act
				const result = messageSatisfiesCondition(['to', 'matches', /^.*@baz.com$/], message);

				// Assert
				expect(result).toBe(false);
			});
		});
	});

	describe.concurrent('with AND condition', () => {
		it('returns true when all conditions are true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					and: [
						['to', 'contains', 'bar.com'],
						['to', 'startsWith', 'foo'],
					],
				},
				message,
			);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when any condition is false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					and: [
						['to', 'contains', 'bar.com'],
						['to', 'startsWith', 'bar'],
					],
				},
				message,
			);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with OR condition', () => {
		it('returns true when any condition is true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					or: [
						['to', 'contains', 'baz.com'],
						['to', 'startsWith', 'foo'],
					],
				},
				message,
			);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when all conditions are false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					or: [
						['to', 'contains', 'baz.com'],
						['to', 'startsWith', 'bar'],
					],
				},
				message,
			);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with NOT condition', () => {
		it('returns true when condition is false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					not: ['to', 'contains', 'baz.com'],
				},
				message,
			);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when condition is true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });

			// Act
			const result = messageSatisfiesCondition(
				{
					not: ['to', 'contains', 'bar.com'],
				},
				message,
			);

			// Assert
			expect(result).toBe(false);
		});
	});
});
