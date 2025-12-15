import type { Config, ActionableMessage } from '../../core/types';

export const forwardOriginalMessageOnError = async ({ message, config }: { message: ActionableMessage; config: Config }) => {
	const recipient = config.onError?.forwardOriginalMessageTo;
	const recipientEmail = config.forwardAddresses.find((addr) => addr.name === recipient)?.email;

	if (!recipientEmail) {
		return;
	}

	await message.forward(recipientEmail);
};
