export default function isEmpty(x: string | string[]): boolean {
    if (Array.isArray(x)) {
        return !x.some((xx) => !isEmpty(xx));
    } else {
        return x === null || x === undefined || (typeof x === 'string' && !/\S/.test(x));
    }
}

export { isEmpty };
