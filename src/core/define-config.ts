import type { Config } from './types';

export const defineConfig = <const TForwardAddressName extends string>(
	config: Config<TForwardAddressName>,
): Readonly<Config<TForwardAddressName>> => config;
