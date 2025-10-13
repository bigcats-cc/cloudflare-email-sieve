export const inlineSwitch = <TReturnType, const TValue extends string | number | symbol>(
	value: TValue,
	handlers: Record<TValue, () => TReturnType>,
) => handlers[value]();
