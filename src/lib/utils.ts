export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
