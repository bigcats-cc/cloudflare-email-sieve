import { config } from './config';
import { executeAction } from './adapters/cf-execute-action';
import { determineActionFromMessageRules } from '../core/determine-actions-to-take';
import { enrichMessage } from '../core/enrich-message';
import { logError } from './adapters/cf-log-error';
import { sendErrorReport } from './adapters/cf-send-error-report';
import { forwardOriginalMessageOnError } from './adapters/cf-forward-original-message';
import { nodeMailerParseMessage } from './adapters/nodemailer-parse-message';

export default {
	async email(message, env, _ctx) {
		try {
			const extractedMessage = await nodeMailerParseMessage(message.raw);
			const enrichedMessage = enrichMessage(message, extractedMessage);
			const action = determineActionFromMessageRules(enrichedMessage, config);
			await executeAction(action, message);
		} catch (thrown: unknown) {
			const errorReport = { thrown, reason: 'Unhandled error while processing message', rawMessage: message };
			await Promise.allSettled([
				logError(errorReport),
				sendErrorReport({ ...errorReport, config, notifier: env.ERROR_NOTIFIER }),
				forwardOriginalMessageOnError({ message, config }),
			]);
		}
	},
} satisfies ExportedHandler<Env>;
