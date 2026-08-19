import React from "react";

import Head from "next/head";

import { APP_NAME } from "@/shared/constants/app.constants";

const NextHead: React.FC<{ title?: string; content?: string }> = ({
  title = APP_NAME,
  content,
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={content || ""} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
  </Head>
);

export default NextHead;
