export interface ITraceContext {
  traceId?: string;
  spanId?: string;
  traceSampled?: boolean;
}
