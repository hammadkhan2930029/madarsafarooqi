export const normalizeClassName = name =>
  String(name || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-US');

export const getClassNameKeyId = (branchId, name) =>
  encodeURIComponent(`${branchId}__${normalizeClassName(name)}`);

export const getBranchName = (
  branches,
  branchId,
  fallback = 'Unknown Branch',
) => branches.find(branch => branch.id === branchId)?.name || fallback;
