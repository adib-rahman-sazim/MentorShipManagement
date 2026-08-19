import "reflect-metadata";

import type { FactoryProvider, Provider } from "@nestjs/common";
import { MODULE_METADATA } from "@nestjs/common/constants";
import { ConfigService } from "@nestjs/config";

import * as nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { EEmailProvider } from "@/common/enums/emails.enums";

import type { IEmailService } from "../email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "../emails.constants";
import { EmailsModule } from "../emails.module";
import { MailhogEmailService } from "../mailhog-email.service";
import { ResendEmailService } from "../resend-email.service";

vi.mock("nodemailer");
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn() },
  })),
}));

vi.mocked(nodemailer.createTransport).mockReturnValue({
  sendMail: vi.fn(),
} as unknown as nodemailer.Transporter);

describe("EmailsModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getEmailServiceFactoryProvider(): FactoryProvider {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, EmailsModule) as Provider[];
    const emailServiceProvider = providers.find(
      (provider): provider is FactoryProvider =>
        typeof provider === "object" &&
        provider !== null &&
        "provide" in provider &&
        provider.provide === EMAIL_SERVICE_TOKEN,
    );

    if (!emailServiceProvider?.useFactory) {
      throw new Error("EMAIL_SERVICE provider factory is not configured in EmailsModule");
    }

    return emailServiceProvider;
  }

  function createEmailService(emailProvider: string): IEmailService {
    const configService = mockDeep<ConfigService>();
    configService.getOrThrow.mockImplementation((key) => {
      if (key === "EMAIL_PROVIDER") {
        return emailProvider;
      }

      if (key === "SEND_FROM_EMAIL") {
        return "noreply@example.com";
      }

      if (key === "RESEND_API_KEY") {
        return "re_test_key";
      }

      throw new Error(`Unexpected config key: ${key}`);
    });

    const emailServiceFactoryProvider = getEmailServiceFactoryProvider();
    return emailServiceFactoryProvider.useFactory?.(configService) as IEmailService;
  }

  it("returns MailhogEmailService for mailhog", () => {
    const emailService = createEmailService(EEmailProvider.MAILHOG);

    expect(emailService).toBeInstanceOf(MailhogEmailService);
  });

  it("returns ResendEmailService for resend", () => {
    const emailService = createEmailService(EEmailProvider.RESEND);

    expect(emailService).toBeInstanceOf(ResendEmailService);
  });

  it("throws on unknown provider", () => {
    expect(() => createEmailService("ses")).toThrow(/Unsupported EMAIL_PROVIDER/);
  });
});
