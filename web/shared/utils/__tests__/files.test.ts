import { type Mock, vi } from "vitest";

import { getS3AccessibleUrlAfterUpload, uploadToS3 } from "../files";

describe("uploadToS3", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            value: "Testing something!",
          }),
      }),
    ) as Mock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should upload a file to S3", async () => {
    const presignedUrl = "https://example.com";
    const file = new File([""], "filename");

    await uploadToS3(presignedUrl, file);

    expect(fetch).toHaveBeenCalledWith(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "x-amz-acl": "public-read",
      },
    });
  });
});

describe("getS3AccessibleUrlAfterUpload", () => {
  it("should return the URL without query parameters", () => {
    const url = "https://example.com/1.png?query=param";
    expect(getS3AccessibleUrlAfterUpload(url)).toBe("https://example.com/1.png");
  });

  it("should throw an error if the URL is invalid", () => {
    expect(() => getS3AccessibleUrlAfterUpload(undefined)).toThrow("Invalid URL");

    expect(() => getS3AccessibleUrlAfterUpload(null)).toThrow("Invalid URL");

    expect(() => getS3AccessibleUrlAfterUpload("")).toThrow("Invalid URL");

    expect(() => getS3AccessibleUrlAfterUpload("https:")).toThrow("Invalid URL");
  });
});
