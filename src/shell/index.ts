import { config } from './config';
import { executeAction } from './adapters/cf-execute-action';
import { determineActionFromMessageRules } from '../core/determine-actions-to-take';
import { enrichMessage } from '../core/enrich-message';

export default {
	async email(message, _env, _ctx) {
		const enrichedMessage = enrichMessage(message);
		const action = determineActionFromMessageRules(enrichedMessage, config);
		await executeAction(action, message);
	},
} satisfies ExportedHandler<Env>;
