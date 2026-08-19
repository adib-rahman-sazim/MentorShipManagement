export interface IBaseInteractor<TContext, TResult> {
  execute(context: TContext): TResult | Promise<TResult>;
}
