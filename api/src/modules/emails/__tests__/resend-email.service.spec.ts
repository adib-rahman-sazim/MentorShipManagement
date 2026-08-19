import { Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { ResendEmailService } from "../resend-email.service";

describe("ResendEmailService", () => {
  let configService: ReturnType<typeof mockDeep<ConfigService>>;
  let service: ResendEmailService;
  let loggerErrorSpy: ReturnType<typeof vi.spyOn>;
  let resendSendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    configService = mockDeep<ConfigService>();
    configService.getOrThrow.mockImplementation((key) => {
      if (key === "SEND_FROM_EMAIL") {
        return "noreply@example.com";
      }

      if (key === "RESEND_API_KEY") {
        return "re_test_key";
      }

      throw new Error(`Unexpected config key: ${key}`);
    });

    loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

    service = new ResendEmailService(configService);

    resendSendMock = vi.fn().mockResolvedValue({ id: "email_1" });
    (
      service as unknown as {
        resend: { emails: { send: ReturnType<typeof vi.fn> } };
      }
    ).resend = {
      emails: {
        send: resendSendMock,
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sendEmailByTextOrHtml sends html when provided", async () => {
    await service.sendEmailByTextOrHtml({
      to: "user@example.com",
      subject: "Subject",
      html: "<p>HTML Body</p>",
      text: "Text Body",
    });

    expect(resendSendMock).toHaveBeenCalledWith({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Subject",
      html: "<p>HTML Body</p>",
    });
  });

  it("sendEmailByTextOrHtml falls back to text when html is empty", async () => {
    await service.sendEmailByTextOrHtml({
      to: "user@example.com",
      from: "override@example.com",
      subject: "Subject",
      text: "Text Only",
      html: "",
    });

    expect(resendSendMock).toHaveBeenCalledWith({
      from: "override@example.com",
      to: "user@example.com",
      subject: "Subject",
      html: "Text Only",
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

    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("logs error when resend send fails and does not throw", async () => {
    resendSendMock.mockRejectedValueOnce(new Error("api down"));

    await expect(
      service.sendEmailByTextOrHtml({
        to: "user@example.com",
        subject: "Subject",
        html: "<p>HTML</p>",
      }),
    ).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalled();
  });
});
