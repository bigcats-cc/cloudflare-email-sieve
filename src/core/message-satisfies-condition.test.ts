import { it, describe, expect } from 'vitest';
import { messageSatisfiesCondition } from './message-satisfies-condition';
import type { EnrichedMessage, SimpleMessage, Condition, ExtractedMessage } from './types';
import { enrichMessage } from './enrich-message';
import { and, field, not, or } from './define-config';

const _mockMessage = (simpleMessage: Partial<SimpleMessage> = {}, parsedMessage: Partial<ExtractedMessage> = {}): EnrichedMessage =>
	enrichMessage(
		{
			from: 'a@b.com',
			to: 'a@b.com',
			headers: new Headers(),
			raw: new ReadableStream(),
			rawSize: 0,
			...simpleMessage,
		},
		{
			body: { text: '', html: '' },
			hasAttachments: false,
			...parsedMessage,
		},
	);

describe.concurrent('messageSatisfiesCondition', () => {
	describe.concurrent('with function condition', () => {
		it('returns true when function returns true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition: Condition = ({ envelope }) => envelope.to.emailAddress === 'foo@bar.com';

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when function returns false', () => {
			// Arrange
			const message = _mockMessage({ to: 'bar@foo.com' });
			const condition: Condition = ({ envelope }) => envelope.to.emailAddress === 'foo@bar.com';

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with simple condition', () => {
		describe.concurrent('field value contains string', () => {
			it('returns true when field value contains string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'contains', 'bar.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not contain string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'contains', 'baz.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value equals string', () => {
			it('returns true when field value equals string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'equals', 'foo@bar.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not equal string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'equals', 'bar@foo.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value starts with string', () => {
			it('returns true when field value starts with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'startsWith', 'foo');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not start with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'startsWith', 'bar');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value ends with string', () => {
			it('returns true when field value ends with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'endsWith', 'bar.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not end with string', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'endsWith', 'baz.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value in array', () => {
			it('returns true when field value is in array', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'in', ['foo@bar.com']);

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value is not in array', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'in', ['bar@foo.com']);

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('field value matches regex', () => {
			it('returns true when field value matches regex', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'matches', /^.*@bar.com$/);

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when field value does not match regex', () => {
				// Arrange
				const message = _mockMessage({ to: 'foo@bar.com' });
				const condition = field('envelope.to.emailAddress', 'matches', /^.*@baz.com$/);

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});
	});

	describe.concurrent('with array elements', () => {
		describe.concurrent('with $some', () => {
			it('returns true when some array element satisfies condition', () => {
				// Arrange
				const message = _mockMessage(
					{
						headers: new Headers({ To: 'foo@bar.com, bar@baz.com' }),
					},
					{
						to: [
							{ name: '', address: 'foo@bar.com' },
							{ name: '', address: 'bar@baz.com' },
						],
					},
				);
				const condition = field('to.$some.domain', 'contains', 'baz.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when no array element satisfies condition', () => {
				// Arrange
				const message = _mockMessage(
					{
						headers: new Headers({ To: 'foo@bar.com, bar@baz.com' }),
					},
					{
						to: [
							{ name: '', address: 'foo@bar.com' },
							{ name: '', address: 'bar@baz.com' },
						],
					},
				);
				const condition = field('to.$some.domain', 'contains', 'qux.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});

		describe.concurrent('with $every', () => {
			it('returns true when every array element satisfies condition', () => {
				// Arrange
				const message = _mockMessage(
					{
						headers: new Headers({ To: 'foo@barbaz.com, bar@baz.com' }),
					},
					{
						to: [
							{ name: '', address: 'foo@barbaz.com' },
							{ name: '', address: 'bar@baz.com' },
						],
					},
				);
				const condition = field('to.$every.domain', 'contains', 'baz.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(true);
			});

			it('returns false when some array elements do not satisfy the condition', () => {
				// Arrange
				const message = _mockMessage(
					{
						headers: new Headers({ To: 'foo@bar.com, bar@baz.com' }),
					},
					{
						to: [
							{ name: '', address: 'foo@bar.com' },
							{ name: '', address: 'bar@baz.com' },
						],
					},
				);
				const condition = field('to.$every.domain', 'contains', 'baz.com');

				// Act
				const result = messageSatisfiesCondition(condition, message);

				// Assert
				expect(result).toBe(false);
			});
		});
	});

	describe.concurrent('with AND condition', () => {
		it('returns true when all conditions are true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = and(
				field('envelope.to.emailAddress', 'contains', 'bar.com'),
				field('envelope.to.emailAddress', 'startsWith', 'foo'),
			);

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when any condition is false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = and(
				field('envelope.to.emailAddress', 'contains', 'bar.com'),
				field('envelope.to.emailAddress', 'startsWith', 'bar'),
			);

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with OR condition', () => {
		it('returns true when any condition is true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = or(
				field('envelope.to.emailAddress', 'contains', 'baz.com'),
				field('envelope.to.emailAddress', 'startsWith', 'foo'),
			);

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when all conditions are false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = or(
				field('envelope.to.emailAddress', 'contains', 'baz.com'),
				field('envelope.to.emailAddress', 'startsWith', 'bar'),
			);

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe.concurrent('with NOT condition', () => {
		it('returns true when condition is false', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = not(field('envelope.to.emailAddress', 'contains', 'baz.com'));

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when condition is true', () => {
			// Arrange
			const message = _mockMessage({ to: 'foo@bar.com' });
			const condition = not(field('envelope.to.emailAddress', 'contains', 'bar.com'));

			// Act
			const result = messageSatisfiesCondition(condition, message);

			// Assert
			expect(result).toBe(false);
		});
	});
});
