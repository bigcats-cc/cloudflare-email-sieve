import type { ErrorReport } from '../../core/types';

export const logError = ({ thrown, reason, rawMessage }: ErrorReport) => {
	const error = thrown instanceof Error ? thrown : new Error(String(thrown));
	const headers = Object.fromEntries(rawMessage.headers.entries());

	console.error({ ...headers, _errorReason: reason, _errorMessage: error.message, _errorStackTrace: error.stack });
};
