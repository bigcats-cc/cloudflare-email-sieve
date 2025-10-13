# Cloudflare Email Sieve

Simple rule engine for Cloudflare Email Routing. Runs as a Cloudflare Worker.

## Getting started

### Prerequisites

- NodeJS >= 24.x
- A Cloudflare account with Email Routing enabled.

### Using this project

1. Run `npm install`
2. Before you can use this project, you must fetch the worker typings by running this command: `npm run cf-typegen`
3. Define your rules in `src/shell/config.ts` (see the "Defining rules" section below for more details)
4. Log in to Cloudflare by running `npx wrangler login`

## Defining rules

Rules are defined in `src/shell/config.ts`. Each rule consists of a set of conditions and actions. Rules are executed in order, and if no rules match, the email is rejected by default.

### Unconditionally forward all emails to a specific address

Rules that have no condition are treated as catch-all rules and will match any email.

```typescript
export const config = defineConfig({
	forwardAddresses: [
		{ name: 'carter', email: 'samantha.carter@sg1.airforce.mil' },
	],
	rules: [
		{
			forwardTo: ['carter'],
		},
	],
});
```

### Forward emails based on recipient address

```typescript
export const config = defineConfig({
	forwardAddresses: [
		{ name: 'carter', email: 'samantha.carter@airforce.mil' },
		{ name: 'oneal', email: 'jack.oneal@airforce.mil' },
	],
	rules: [
		{
			condition: ['to', 'startsWith', 'jack'],
			forwardTo: ['oneal'],
		},
		{
			condition: {
				or: [
						['to', 'startsWith', 'all@'],
						['to', 'equals', 'sg1@airforce.mil']
					],
				},
			forwardTo: ['oneal', 'carter'],
		},
		{
			forwardTo: ['carter'],
		},
	],
});
```

### Advanced: forward emails based on headers

```typescript
export const config = defineConfig({
	forwardAddresses: [
		{ name: 'carter', email: 'samantha.carter@airforce.mil' },
	],
	rules: [
		{
			condition(message) {
				return message.headers.get('x-secret-key') === 'foo'
			},
			forwardTo: ['carter'],
		},
		{
			reject: 'Unauthorized',
		}
	],
});
```
