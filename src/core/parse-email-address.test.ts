import { it, describe, expect } from 'vitest';
import { parseEmailAddress } from './parse-email-address';

describe.concurrent('parseEmailAddress', () => {
	describe.concurrent('when given a display name and email', () => {
		it('should extract the display name', () => {
			// Arrange
			const email = 'Some Person <some.person@some.domain>';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				displayName: 'Some Person',
			});
		});

		it('should throw when the end chevron is missing', () => {
			// Arrange
			const email = 'Some Person <some.person@some.domain';

			// Act
			const act = () => parseEmailAddress(email);

			// Assert
			expect(act).toThrow(/invalid/i);
		});

		it('should extract the email address', () => {
			// Arrange
			const email = 'Some Person <some.person@some.domain>';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				emailAddress: 'some.person@some.domain',
			});
		});

		it('should extract the local part and domain', () => {
			// Arrange
			const email = 'Some Person <some.person@some.domain>';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				localPart: 'some.person',
				domain: 'some.domain',
			});
		});

		it('should extract the plus alias when present', () => {
			// Arrange
			const email = 'Some Person <some.person+alias@some.domain>';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				plusAlias: 'alias',
			});
		});
	});

	describe.concurrent('when given only an email address', () => {
		it('should extract the email address', () => {
			// Arrange
			const email = 'some.person@some.domain';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				emailAddress: 'some.person@some.domain',
			});
		});

		it('should extract the local part and domain', () => {
			// Arrange
			const email = 'some.person@some.domain';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				localPart: 'some.person',
				domain: 'some.domain',
			});
		});

		it('should extract the plus alias when present', () => {
			// Arrange
			const email = 'some.person+alias@some.domain';

			// Act
			const result = parseEmailAddress(email);

			// Assert
			expect(result).toMatchObject({
				plusAlias: 'alias',
			});
		});
	});
});
