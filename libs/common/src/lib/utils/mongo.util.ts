export function isValidObjectId(id: string): boolean {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return false;
  } else {
    return true;
  }
}
