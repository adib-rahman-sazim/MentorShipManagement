import { Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { MailhogEmailService } from "../mailhog-email.service";

describe("MailhogEmailService", () => {
  let configService: ReturnType<typeof mockDeep<ConfigService>>;
  let service: MailhogEmailService;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;
  let sendMailMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    configService = mockDeep<ConfigService>();

    configService.get.mockImplementation((key) => {
      if (key === "MAILHOG_HOST") {
        return "mailhog.example.internal";
      }

      if (key === "MAILHOG_PORT") {
        return 2025;
      }

      return undefined;
    });

    configService.getOrThrow.mockImplementation((key) => {
      if (key === "SEND_FROM_EMAIL") {
        return "noreply@example.com";
      }

      throw new Error(`Unexpected config key: ${key}`);
    });

    loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

    service = new MailhogEmailService(configService);

    sendMailMock = vi.fn().mockResolvedValue({ messageId: "mailhog-1" });
    (
      service as unknown as {
        transporter: { sendMail: ReturnType<typeof vi.fn> };
      }
    ).transporter = {
      sendMail: sendMailMock,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sendEmailByTextOrHtml sends expected nodemailer payload", async () => {
    await service.sendEmailByTextOrHtml({
      to: "user@example.com",
      subject: "Subject",
      text: "Text Body",
      html: "<p>HTML Body</p>",
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      to: "user@example.com",
      from: "noreply@example.com",
      subject: "Subject",
      text: "Text Body",
      html: "<p>HTML Body</p>",
    });
  });

  it("sendEmailByTemplateId throws NotImplementedException and does not send", async () => {
    await expect(
      service.sendEmailByTemplateId({
        to: "recipient@example.com",
        templateId: "legacy-template-id",
        templateData: { foo: "bar" },
      }),
    ).rejects.toBeInstanceOf(NotImplementedException);

    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("logs error when sendMail fails and does not throw", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("smtp down"));

    await expect(
      service.sendEmailByTextOrHtml({
        to: "user@example.com",
        subject: "Subject",
        text: "Text Body",
      }),
    ).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalled();
  });
});
