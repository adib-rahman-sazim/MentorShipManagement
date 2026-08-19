export function uploadToS3(presignedUrl: string, file: File) {
  return fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "x-amz-acl": "public-read",
    },
  });
}

export function getS3AccessibleUrlAfterUpload(uploadedFileUrl?: string | null) {
  if (!uploadedFileUrl) {
    throw new Error("Invalid URL");
  }

  const url = new URL(uploadedFileUrl);
  url.search = "";
  return url.href.toString();
}
