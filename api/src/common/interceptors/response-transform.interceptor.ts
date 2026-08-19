import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { Observable } from "rxjs";

import type { IResponse } from "@/common/interceptors/response-transform.interceptor.interfaces";

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return new Observable<IResponse<T>>((subscriber) => {
      const subscription = next.handle().subscribe({
        next: (data) => {
          subscriber.next({
            statusCode: context.switchToHttp().getResponse().statusCode,
            message: data?.message || "",
            data,
          });
        },
        error: (error: unknown) => {
          subscriber.error(error);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }
}
