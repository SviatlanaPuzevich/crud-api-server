export interface MatchResult {
  matched: boolean;
  params: Record<string, string>;
}

export function matchPath(template: string, actual: string): MatchResult {
  const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

  const templateNormalized = normalize(template);
  const actualNormalized = normalize(actual);

  const paramNames: string[] = [];
  const regexString =
    "^" +
    templateNormalized.replace(/\{(\w+)\}/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    }) +
    "$";

  const regex = new RegExp(regexString);
  const match = regex.exec(actualNormalized);

  if (!match) return { matched: false, params: {} };

  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1]!;
  });

  return { matched: true, params };
}

export function normalizePath(path: string): string {
  let normalized = path.replace(/\/+$/, "");
  if (normalized === "") {
    return "/";
  }
  normalized = normalized.replace(/\/+/g, "/");
  return normalized;
}
