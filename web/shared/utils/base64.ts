export const encodeObjectToBase64 = (data: Record<string, unknown>) => {
  const dataString = JSON.stringify(data);
  const dataBase64 = Buffer.from(dataString).toString("base64");

  return dataBase64.replace(/=+$/, "");
};

export const decodeBase64ToObject = (data: string): Record<string, unknown> => {
  const dataString = Buffer.from(data, "base64").toString("utf8");

  const dataObject = JSON.parse(dataString);

  return dataObject;
};
