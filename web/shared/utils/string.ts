export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function getInitials(name: string): string {
  let initials = "";
  const words: string[] = name.trim().split(/\s+/);

  if (!words.length) {
    return initials;
  }

  if (words[0] && words[0].length > 0) {
    initials += words[0].substring(0, 1).toUpperCase();
  }

  const lastWord = words[words.length - 1];
  if (lastWord && words.length > 1 && lastWord.length > 0) {
    initials += lastWord.substring(0, 1).toUpperCase();
  }

  return initials;
}
