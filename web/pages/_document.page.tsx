// biome-ignore lint/suspicious/noDocumentImportInPage: This project uses the .page.tsx suffix for Next.js pages.
import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";

import { ELocale } from "@/shared/typedefs/enums";

export default class _Document extends Document {
  static override async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  override render() {
    const locale = this.props.__NEXT_DATA__.locale;

    const languageDirection = locale === ELocale.ARABIC ? "rtl" : "ltr";

    return (
      <Html dir={languageDirection}>
        <Head>
          <script src="/__ENV.js" />
        </Head>
        <body dir={languageDirection}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
