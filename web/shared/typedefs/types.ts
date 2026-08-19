import { PropsWithChildren } from "react";

import { NextPage } from "next";
import { AppProps } from "next/app";

import { ColumnDef } from "@tanstack/react-table";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P];
};

export type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends unknown[]
    ? `${TKey}`
    : TObj[TKey] extends object
      ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
      : `${TKey}`;
}[keyof TObj & (string | number)];

export type TApiResponse<TData> = {
  statusCode: number;
  message: string;
  data: TData;
};

export type TPaginationMetadata = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TPaginatedResponse<TData> = {
  data: TData[];
  meta: TPaginationMetadata;
};

export type TApiErrorResponse = {
  status: number;
  data: {
    statusCode: number;
    message: string[] | string;
    error: string;
  };
};

export type TNullable<T> = { [K in keyof T]: T[K] | null };

export type NextApplicationPage<P = unknown, IP = P> = NextPage<P, IP> & {
  Guard?: (props: PropsWithChildren) => JSX.Element;
  Layout?: (props: PropsWithChildren) => JSX.Element;
};

export type TCustomAppProps<P = unknown> = AppProps & {
  Component: NextApplicationPage;
  pageProps: P;
};

export type TDataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
};
