import {
  normalizeBranchCode,
  validateBranch,
} from '../src/Utils/validationSchemas';
import apiClient from '../src/api/client';
import { createBranch } from '../src/Services/branchService';

jest.mock('../src/api/client', () => ({ post: jest.fn() }));

describe('branch management utilities', () => {
  const validBranch = {
    name: 'Main Campus',
    code: ' main-01 ',
    address: 'Main Road, City',
    contact: '+92 300 1234567',
  };

  test('normalizes code and creates deterministic document ID', () => {
    expect(normalizeBranchCode(validBranch.code)).toBe('MAIN-01');
    expect(
      `branch_${normalizeBranchCode(validBranch.code).toLowerCase()}`,
    ).toBe('branch_main-01');
  });

  test('accepts a valid branch', () => {
    expect(validateBranch(validBranch)).toBe('');
  });

  test('rejects invalid code, address, and contact', () => {
    expect(validateBranch({ ...validBranch, code: 'bad/code' })).toBe(
      'validation.branchCode',
    );
    expect(validateBranch({ ...validBranch, address: 'A' })).toBe(
      'validation.branchAddress',
    );
    expect(validateBranch({ ...validBranch, contact: 'abc' })).toBe(
      'validation.contact',
    );
  });

  test('creates a branch with trimmed class names in one request', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          id: '1',
          name: 'Main Campus',
          code: 'MAIN-01',
          address: 'Main Road, City',
          contact: null,
          status: 'ACTIVE',
          classCount: 2,
          classes: [
            { id: '1', name: 'Hifz', status: 'ACTIVE' },
            { id: '2', name: 'Nazra', status: 'ACTIVE' },
          ],
        },
      },
    });
    const result = await createBranch({
      ...validBranch,
      classes: [' Hifz ', 'Nazra'],
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/branches',
      expect.objectContaining({ classes: ['Hifz', 'Nazra'] }),
    );
    expect(result.class_count).toBe(2);
    expect(result.classes.map(item => item.name)).toEqual(['Hifz', 'Nazra']);
  });
});
