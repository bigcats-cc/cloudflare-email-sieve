type GetTypeAtPath<T, TPath extends string> = TPath extends keyof T
	? T[TPath]
	: TPath extends `${infer First}.${infer Rest}`
		? First extends keyof T
			? GetTypeAtPath<T[First], Rest>
			: never
		: never;

export const getValueAtPath = <T, TPath extends string>(obj: T, path: TPath): GetTypeAtPath<T, TPath> => {
	const parts = path.split('.');
	let current: any = obj;

	for (const part of parts) {
		current = current[part];

		if (current === undefined || current === null) {
			break;
		}
	}

	return current;
};
