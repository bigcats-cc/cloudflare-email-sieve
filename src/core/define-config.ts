import type { Config, AggregateConditionFunction, ConditionFunction } from './types';

export const and: AggregateConditionFunction = (...rules) => ['$and', ...rules];
export const or: AggregateConditionFunction = (...rules) => ['$or', ...rules];
export const not: AggregateConditionFunction = (rule) => ['$not', rule];
export const field: ConditionFunction = (path, operator, value) => [path, operator, value] as any;

export const defineConfig = <const TForwardAddressName extends string>(
	config: Config<TForwardAddressName>,
): Readonly<Config<TForwardAddressName>> => config;
