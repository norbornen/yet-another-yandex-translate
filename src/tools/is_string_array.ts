export default function isStringArray(x: any): x is string[] {
    return Array.isArray(x) && !x.some((o) => !(typeof o === 'string' || o === null || o === undefined));
}

export { isStringArray };
