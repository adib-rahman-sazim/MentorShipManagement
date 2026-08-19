import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EEmailProvider } from "@/common/enums/emails.enums";

import type { IEmailService } from "./email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "./emails.constants";
import { MailhogEmailService } from "./mailhog-email.service";
import { ResendEmailService } from "./resend-email.service";

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE_TOKEN,
      useFactory: (configService: ConfigService): IEmailService => {
        const emailProvider = configService.getOrThrow<EEmailProvider>("EMAIL_PROVIDER");

        switch (emailProvider) {
          case EEmailProvider.MAILHOG:
            return new MailhogEmailService(configService);
          case EEmailProvider.RESEND:
            return new ResendEmailService(configService);
          default:
            throw new Error(`Unsupported EMAIL_PROVIDER: ${emailProvider}`);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [EMAIL_SERVICE_TOKEN],
})
export class EmailsModule {}
