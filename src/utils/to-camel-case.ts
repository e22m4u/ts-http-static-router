/**
 * To camel case.
 *
 * @param input
 */
export function toCamelCase(input: string): string {
  return input
    .replace(/(^\w|[A-Z]|\b\w)/g, c => c.toUpperCase())
    .replace(/\W+/g, '')
    .replace(/(^\w)/g, c => c.toLowerCase());
}
