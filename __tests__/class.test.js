import {
  getBranchName,
  getClassNameKeyId,
  normalizeClassName,
} from '../src/Utils/classes';
import { validateClass } from '../src/Utils/validationSchemas';

describe('class management utilities', () => {
  test('normalizes whitespace and case for uniqueness', () => {
    expect(normalizeClassName('  Grade   One ')).toBe('grade one');
    expect(getClassNameKeyId('branch_main', 'Grade One')).toBe(
      'branch_main__grade%20one',
    );
  });

  test('keeps uniqueness scoped to a branch', () => {
    expect(getClassNameKeyId('branch_a', 'Grade One')).not.toBe(
      getClassNameKeyId('branch_b', 'Grade One'),
    );
  });

  test('validates required name and branch', () => {
    expect(validateClass({ name: 'Grade One', branchId: 'branch_main' })).toBe(
      '',
    );
    expect(validateClass({ name: 'A', branchId: 'branch_main' })).toBe(
      'validation.className',
    );
    expect(validateClass({ name: 'Grade One', branchId: '' })).toBe(
      'validation.branchRequired',
    );
  });

  test('resolves branch names safely', () => {
    const branches = [{ id: 'branch_main', name: 'Main Campus' }];
    expect(getBranchName(branches, 'branch_main')).toBe('Main Campus');
    expect(getBranchName(branches, 'missing')).toBe('Unknown Branch');
  });
});
