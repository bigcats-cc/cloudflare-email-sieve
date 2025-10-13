import { defineConfig } from '../core/define-config';

export const config = defineConfig({
	forwardAddresses: [{ name: 'carter', email: 'samantha.carter@sg1.airforce.mil' }],
	rules: [
		{
			forwardTo: ['carter'],
		},
	],
});
