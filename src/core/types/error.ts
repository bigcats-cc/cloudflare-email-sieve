import type { SimpleMessage } from './message';

export type ErrorReport = { thrown: unknown; reason: string; rawMessage: SimpleMessage };
