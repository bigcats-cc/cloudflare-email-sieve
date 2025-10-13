import { config } from './config';
import { executeAction } from './adapters/cf-execute-action';
import { determineActionFromMessageRules } from '../core/determine-actions-to-take';

export default {
	async email(message, _env, _ctx) {
		const action = determineActionFromMessageRules(message, config);
		await executeAction(action, message);
	},
} satisfies ExportedHandler<Env>;
