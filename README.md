# Cloudflare Email Sieve

Simple rule engine for Cloudflare Email Routing. Runs as a Cloudflare Worker.

## Getting started

### Prerequisites

- NodeJS >= 24.x
- git and knowledge of how to use it.
- A Cloudflare account with Email Routing enabled.

### Using this project

1. Run `npm install`
2. Before you can use this project, you must fetch the worker typings by running this command: `npm run cf-typegen`
3. Define your rules in `src/shell/config.ts` (see the "Defining rules" section below for more details)
4. Commit your changes and push to your git repository.
5. On Cloudflare, create a new worker and choose "Import a repository".
6. On the repository selection screen, select your git repository.
7. Give your worker a suitable name and leave the other settings unchanged.
8. Create and deploy your worker.
9. Configure Email Routing to use your new worker.

## Defining rules

Rules are defined in `src/shell/config.ts`. Each rule consists of a set of conditions and actions. Rules are executed in order, and if no rules match, the email is rejected by default.

### Unconditionally forward all emails to a specific address

Rules that have no condition are treated as catch-all rules and will match any email.

```typescript
export const config = defineConfig({
	forwardAddresses: [{ name: 'carter', email: 'samantha.carter@sg1.airforce.mil' }],
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
			when: field('to', 'startsWith', 'jack'),
			forwardTo: ['oneal'],
		},
		{
			when: or(
				field('envelope.to.emailAddress', 'contains', 'oneal'),
				field('to.$some.localPart', 'equals', 'all'),
				field('to.$some.emailAddress', 'equals', 'sg1@airforce.mil'),
			),
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
	forwardAddresses: [{ name: 'carter', email: 'samantha.carter@airforce.mil' }],
	rules: [
		{
			when: (message) => message.headers.get('x-secret-key') === 'foo',
			forwardTo: ['carter'],
		},
		{
			rejectWithReason: 'Unauthorized',
		},
	],
});
```
