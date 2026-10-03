import {
  filterStudentClasses,
  getStudentDocumentId,
  normalizeAdmissionNumber,
} from '../src/Utils/students';
import { validateStudent } from '../src/Utils/validationSchemas';

describe('student management utilities', () => {
  const validStudent = {
    admissionNo: ' adm-001 ',
    name: 'Student One',
    fatherName: 'Father One',
    contact: '+92 300 1234567',
    branchId: 'branch_main',
    classId: 'class_one',
  };

  test('normalizes admission number into a deterministic document ID', () => {
    expect(normalizeAdmissionNumber(validStudent.admissionNo)).toBe('ADM-001');
    expect(getStudentDocumentId(validStudent.admissionNo)).toBe(
      'student_ADM-001',
    );
  });

  test('validates student fields', () => {
    expect(validateStudent(validStudent)).toBe('');
    expect(validateStudent({ ...validStudent, admissionNo: '!' })).toBe(
      'validation.admissionNo',
    );
    expect(validateStudent({ ...validStudent, fatherName: '' })).toBe(
      'validation.fatherName',
    );
    expect(validateStudent({ ...validStudent, contact: 'invalid' })).toBe(
      'validation.contact',
    );
  });

  test('filters active classes by selected branch', () => {
    const classes = [
      { id: 'one', branch_id: 'a', status: 'active' },
      { id: 'two', branch_id: 'a', status: 'inactive' },
      { id: 'three', branch_id: 'b', status: 'active' },
    ];
    expect(filterStudentClasses(classes, 'a')).toEqual([classes[0]]);
  });
});
