import { Injectable, Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Resend } from "resend";

import type { IEmailService } from "./email-service.interfaces";

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly defaultSenderEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultSenderEmail = this.configService.getOrThrow<string>("SEND_FROM_EMAIL");
    const apiKey = this.configService.getOrThrow<string>("RESEND_API_KEY");
    this.resend = new Resend(apiKey);
  }

  async sendEmailByTextOrHtml({
    to,
    subject,
    from = this.defaultSenderEmail,
    text = "",
    html = "",
  }: {
    to: string;
    subject: string;
    from?: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      const emailOptions: Parameters<typeof this.resend.emails.send>[0] = {
        from,
        to,
        subject,
        html: html || text,
      };

      await this.resend.emails.send(emailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}. Error occurred: ${error}`, error);
    }
  }

  sendEmailByTemplateId({
    templateId,
  }: {
    to: string;
    from?: string;
    templateId: string;
    templateData?: Record<string, unknown>;
  }): Promise<void> {
    return Promise.reject(
      new NotImplementedException(
        `sendEmailByTemplateId is not supported by ResendEmailService. Template ID: ${templateId}`,
      ),
    );
  }
}
