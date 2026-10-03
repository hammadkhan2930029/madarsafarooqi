export const normalizeAdmissionNumber = value =>
  String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');

export const getStudentDocumentId = admissionNumber =>
  `student_${encodeURIComponent(normalizeAdmissionNumber(admissionNumber))}`;

export const filterStudentClasses = (classes, branchId, activeOnly = true) =>
  classes.filter(
    item =>
      item.branch_id === branchId && (!activeOnly || item.status === 'active'),
  );
