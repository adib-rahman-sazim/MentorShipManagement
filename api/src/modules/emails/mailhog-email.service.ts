import { Injectable, Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import * as nodemailer from "nodemailer";

import type { IEmailService } from "./email-service.interfaces";
import { DEFAULT_MAILHOG_HOST, DEFAULT_MAILHOG_PORT } from "./emails.constants";

@Injectable()
export class MailhogEmailService implements IEmailService {
  private readonly logger = new Logger(MailhogEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly defaultSenderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>("MAILHOG_HOST") ?? DEFAULT_MAILHOG_HOST;
    const port = this.configService.get<number>("MAILHOG_PORT") ?? DEFAULT_MAILHOG_PORT;
    this.defaultSenderEmail = this.configService.getOrThrow<string>("SEND_FROM_EMAIL");

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
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
      await this.transporter.sendMail({
        to,
        from,
        subject,
        text,
        html,
      });
      this.logger.log(`Email sent to ${to} via Mailhog`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} via Mailhog. Error: ${error}`, error);
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
        `sendEmailByTemplateId is not supported by MailhogEmailService. Template ID: ${templateId}`,
      ),
    );
  }
}
