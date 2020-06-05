export const fsExistsSync = (way: string): boolean => {
    try {
        Deno.statSync(way);
    } catch (e) {
        return false;
    }
    return true;
};
