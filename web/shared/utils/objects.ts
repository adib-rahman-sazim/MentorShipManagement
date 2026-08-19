export function getNestedObjectValue<T extends Record<string, unknown>, U extends keyof T>(
  obj: T,
  path: string,
  // biome-ignore lint/suspicious/noExplicitAny: Nested path walk yields dynamic intermediate values.
): U extends keyof T ? T[U] : any {
  const keys = path.split(".");
  // biome-ignore lint/suspicious/noExplicitAny: Nested path walk yields dynamic intermediate values.
  let value: any = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    }
  }

  return value;
}

export function getSelectOptionsFromEnum<T extends string>(enumObj: {
  [key: string]: T;
}): { value: string; label: T }[] {
  return Object.entries(enumObj).map(([key, value]) => ({ value: key, label: value }));
}
