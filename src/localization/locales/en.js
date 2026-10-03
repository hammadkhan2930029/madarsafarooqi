const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    retry: 'Retry',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    all: 'All',
    select: 'Select',
    filters: 'Filters',
    details: 'Details',
    loading: 'Loading...',
    refresh: 'Refresh',
    logout: 'Logout',
    yes: 'Yes',
    no: 'No',
    optional: 'optional',
    unknown: 'Unknown',
    none: '--',
    to: 'to',
    records: '{count} records',
    active: 'Active',
    inactive: 'Inactive',
    activate: 'Activate',
    deactivate: 'Deactivate',
    name: 'Name',
    email: 'Email',
    contact: 'Contact',
    branch: 'Branch',
    class: 'Class',
    status: 'Status',
    date: 'Date',
    teacher: 'Teacher',
    reason: 'Reason',
    password: 'Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    selectOption: 'Select Option',
    noOption: 'No option is available.',
    company: 'Company',
    superAdmin: 'Super Admin',
  },
  auth: {
    login: 'Login',
    loginTitle: 'SmartHazri',
    loginSubtitle:
      'Sign in with the account provided by Mufti Tanveer Hussain.',
    loginId: 'Email Address',
    loginIdPlaceholder: 'name@company.com',
    passwordPlaceholder: 'Password',
    forgotHelp: 'Forgot your password? Contact the Super Admin.',
    loginFailed: 'Login failed',
    changePassword: 'Change My Password',
    passwordChanged: 'Password changed',
    passwordChangedMessage: 'Your password has been updated.',
    passwordChangeFailed: 'Password could not be changed',
    currentPasswordIncorrect: 'Current password is incorrect.',
    passwordDifferent: 'New password must differ from the current password.',
    minimumPassword: 'Minimum 6 characters',
    security: 'Security',
  },
  navigation: {
    branches: 'Branch Management',
    classes: 'Class Management',
    teachers: 'Teacher Management',
    students: 'Student Management',
    reports: 'Teacher Reports',
    leaveRequests: 'Leave Requests',
    attendanceHistory: 'Attendance History',
    teacherPanel: 'Teacher Panel',
    superAdminPanel: 'Super Admin Panel',
  },
  dashboard: {
    loading: 'SmartHazri loading...',
    accountLoadFailed: 'Account could not be loaded',
    attendanceTimezone: 'Attendance day is secured according to UTC timezone.',
    todayComplete: 'Today Complete',
    todayPending: 'Today Pending',
    openTeacherManagement: 'Open Teacher Management',
    teacherManagementNote:
      'Use the complete Teacher Management module for registration, branch/class assignment, timing and salary.',
  },
  branches: {
    title: 'Branch Management',
    add: 'Add Branch',
    edit: 'Edit Branch',
    list: 'Branches',
    code: 'Branch Code',
    codeImmutable: 'Branch code cannot be changed after creation.',
    address: 'Address',
    addressPlaceholder: 'Complete branch address',
    select: 'Select Branch',
    all: 'All Branches',
    details: 'Branch Details',
    searchPlaceholder: 'Name, code, address or contact',
    empty: 'No branch matched the selected filters.',
    loading: 'Branches loading...',
    saved: 'Branch saved',
    createdMessage: 'A new branch was added.',
    updatedMessage: 'Branch details were updated.',
    saveFailed: 'Branch could not be saved',
    loadFailed: 'Branches could not be loaded',
    statusUpdated: 'Branch status updated',
    statusFailed: 'Status could not be updated',
  },
  classes: {
    title: 'Class Management',
    add: 'Add Class',
    edit: 'Edit Class',
    list: 'Classes',
    select: 'Select Class',
    all: 'All Classes',
    details: 'Class Details',
    normalizedName: 'Normalized Name',
    searchPlaceholder: 'Class or branch name',
    empty: 'No class matched the selected filters.',
    loading: 'Classes loading...',
    activeBranchRequired:
      'An active branch is required before creating a class.',
    activeBranchMove: 'A class can only move to an active branch.',
    saved: 'Class saved',
    createdMessage: 'A new class was added.',
    updatedMessage: 'Class details were updated.',
    saveFailed: 'Class could not be saved',
    loadFailed: 'Classes could not be loaded',
    statusUpdated: 'Class status updated',
    statusFailed: 'Status could not be updated',
    branchInactive: 'Branch inactive',
  },
  teachers: {
    title: 'Teacher Management',
    register: 'Register Teacher',
    save: 'Save Teacher',
    list: 'Teachers',
    details: 'Teacher Details',
    teacherName: 'Teacher Name',
    emailLogin: 'Email / Login ID',
    temporaryPassword: 'Temporary Password',
    timing: 'Timing (UTC, 24-hour)',
    baseSalary: 'Base Salary',
    searchPlaceholder: 'Name, email or contact',
    empty: 'No teacher matched the selected filters.',
    loading: 'Teachers loading...',
    loadFailed: 'Teachers could not be loaded',
    saveFailed: 'Teacher could not be saved',
    statusUpdated: 'Teacher status updated',
    statusFailed: 'Status could not be updated',
    resetPassword: 'Reset Password',
    resetTitle: 'Reset Teacher Password',
    resetHelp:
      'Set a temporary password and share it securely with the Teacher.',
    passwordNeverShown:
      'Password is never stored or displayed in the Teacher profile.',
    passwordRequirements:
      'Minimum 8 characters with uppercase, lowercase and a number.',
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
    selectActiveBranch: 'Select active branch',
    selectBranchClass: 'Select branch class',
    unassigned: 'Unassigned',
    allStatuses: 'All Statuses',
    noTeachers: 'There are no teachers yet.',
    searchEmpty: 'No teacher matched your search.',
    editEmail: 'Edit {email}',
  },
  students: {
    title: 'Student Management',
    add: 'Add Student',
    edit: 'Edit Student',
    editAdmission: 'Edit {admissionNo}',
    save: 'Save Student',
    create: 'Create Student',
    list: 'Students',
    studentName: 'Student Name',
    admissionNo: 'Admission Number',
    admissionImmutable: 'Admission number cannot be changed after creation.',
    fatherName: 'Father Name',
    contactOptional: 'Contact (optional)',
    selectActiveBranch: 'Select active branch',
    selectBranchClass: 'Select branch class',
    searchPlaceholder: 'Name or admission number',
    empty: 'No student matched the selected filters.',
    loading: 'Students loading...',
    loadFailed: 'Students could not be loaded',
    saveFailed: 'Student could not be saved',
    statusUpdated: 'Student status updated',
    statusFailed: 'Status could not be updated',
    details: 'Student Details',
  },
  attendance: {
    title: 'Attendance Report',
    today: 'Today',
    sevenDays: '7 Days',
    thirtyDays: '30 Days',
    allTime: 'All Time',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    inLabel: 'In',
    outLabel: 'Out',
    todayTitle: "Today's Attendance (UTC)",
    completeMessage: 'Attendance is complete',
    incompleteMessage: 'Attendance is incomplete',
    myHistory: 'My Attendance',
    noHistory: 'There is no attendance record yet.',
    loadFailed: 'Attendance could not be loaded',
    markFailed: 'Attendance could not be marked',
    refreshFailed: 'Could not refresh',
    complete: 'Complete',
    incomplete: 'Incomplete',
    pending: 'Pending',
    late: 'Late',
    onTime: 'On Time',
    lateUnknown: 'Late status unknown',
    punctuality: 'Punctuality',
    edit: 'Edit Attendance',
    current: 'Current',
    dateUtc: 'Date (UTC, YYYY-MM-DD)',
    checkInIso: 'Check-in (ISO UTC)',
    checkOutIso: 'Check-out (ISO UTC, optional)',
    lateStatus: 'Late status',
    correctionReason: 'Correction reason',
    reasonRequired: 'Reason required',
    saveCorrection: 'Save Correction',
    correctionInvalid: 'Correction is invalid',
    correctionSaved: 'Attendance updated',
    correctionFailed: 'Correction could not be saved',
    exportCsv: 'Share CSV Report',
    exportEmptyTitle: 'Nothing to export',
    exportEmptyMessage: 'Select filters that contain records first.',
    exportFailed: 'Report could not be shared',
    filterEmpty: 'There is no record for this filter.',
    worked: 'worked',
    summary: 'Last {total} records | {complete} complete | {worked} worked',
  },
  reports: {
    title: 'Teacher Reports',
    submitTitle: 'Submit Report',
    editTitle: 'Edit Report',
    filters: 'Report Filters',
    searchLabel: 'Search reports',
    searchPlaceholder: 'Staff, login ID, branch or class',
    type: 'Type',
    reportingPeriod: 'Reporting period',
    dateFilter: 'Date/period filter',
    submitted: 'Submitted Reports ({count})',
    editable: 'Editable',
    expired: 'Edit window expired',
    edit: 'Edit Report',
    shareCsv: 'Share CSV',
    empty: 'There are no reports yet.',
    loadFailed: 'Reports could not be loaded',
    invalid: 'Report is invalid',
    saved: 'Report saved',
    savedMessage: 'Report was saved successfully.',
    saveFailed: 'Report could not be saved',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    contentLabel: 'Report details',
    contentPlaceholder:
      'Write teaching activities, student performance and important notes',
    submit: 'Submit Report',
    update: 'Save Report',
    csvTeacher: 'Teacher',
    csvBranch: 'Branch',
    csvClass: 'Class',
    csvType: 'Report Type',
    csvPeriod: 'Period',
    csvContent: 'Report',
    csvSubmitted: 'Submitted At',
    csvStatus: 'Status',
  },
  leaveRequests: {
    title: 'Leave Requests',
    request: 'Request Leave',
    startDate: 'Start date (UTC, YYYY-MM-DD)',
    endDate: 'End date (UTC, YYYY-MM-DD)',
    reasonPlaceholder: 'Leave reason',
    submit: 'Submit Leave Request',
    readOnlyNote: 'Submitted requests are read-only.',
    dateFilter: 'Date filter (UTC)',
    requestDetails: 'Request Details',
    dates: 'Dates',
    approve: 'Approve',
    reject: 'Reject',
    allRequests: 'All Requests',
    myHistory: 'My Leave History',
    empty: 'There are no leave requests yet.',
    loadFailed: 'Leave requests could not be loaded',
    invalid: 'Leave request is invalid',
    submitted: 'Request submitted',
    submittedMessage: 'Leave request was sent to the Super Admin.',
    submitFailed: 'Request could not be submitted',
    updated: 'Request updated',
    updatedMessage: 'Leave request is now {status}.',
    updateFailed: 'Request could not be updated',
  },
  payroll: {
    title: 'Payroll',
    settings: 'Payroll Settings',
    absentDeduction: 'Absence deduction',
    lateDeduction: 'Late deduction',
    workingDays: 'Working days',
  },
  salaries: {
    title: 'Salaries',
    view: 'View Salary',
    base: 'Base Salary',
    final: 'Final Salary',
    month: 'Month',
    year: 'Year',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    english: 'English',
    urdu: 'اردو',
  },
  status: {
    all: 'All Statuses',
    active: 'Active',
    inactive: 'Inactive',
    complete: 'Complete',
    incomplete: 'Incomplete',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    submitted: 'Submitted',
    present: 'Present',
    absent: 'Absent',
    on_leave: 'On Leave',
    late: 'Late',
    on_time: 'On Time',
  },
  validation: {
    required: 'This field is required.',
    invalidEmail: 'Enter a valid email address.',
    passwordLength: 'Password must contain at least 6 characters.',
    adminPasswordLength: 'Password must contain at least 8 characters.',
    passwordStrength:
      'Password must include uppercase, lowercase and a number.',
    passwordMaximum: 'Password cannot exceed 128 characters.',
    passwordMismatch: 'Passwords do not match.',
    nameLength: 'Name must contain at least 2 characters.',
    companyName: 'Company name is required.',
    contact: 'Enter a valid contact number.',
    branchRequired: 'Select a branch.',
    classRequired: 'Select a class.',
    branchCode:
      'Branch code must contain 2-20 letters, numbers, hyphens or underscores.',
    branchAddress: 'Branch address must contain at least 5 characters.',
    className: 'Class name must contain between 2 and 80 characters.',
    admissionNo:
      'Admission number must contain 2-30 letters, numbers, slashes, hyphens or underscores.',
    fatherName: 'Father name must contain at least 2 characters.',
    timing: 'Enter timing in HH:MM-HH:MM format.',
    timingOrder: 'End time must be after start time.',
    salary: 'Base salary must be zero or a positive number.',
    reportLength: 'Report content must contain between 10 and 5000 characters.',
    period: 'Reporting period is invalid for the selected report type.',
    startDate: 'Enter a valid start date in YYYY-MM-DD format.',
    endDate: 'Enter a valid end date in YYYY-MM-DD format.',
    dateOrder: 'End date cannot be before start date.',
    leaveReason: 'Leave reason must contain between 5 and 1000 characters.',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    invalidCredentials: 'Email or password is incorrect.',
    loadFailed: 'Data could not be loaded.',
    saveFailed: 'Changes could not be saved.',
    unauthorized: 'You are not authorized to perform this action.',
    network: 'Check your internet connection and try again.',
  },
  dialogs: {
    confirmStatus: 'Change status?',
    statusMessage: '{name} will become {status}.',
    success: 'Success',
    confirm: 'Confirm',
    deleteTitle: 'Are you sure?',
  },
  emptyStates: {
    noData: 'No data is available.',
    noSearchResults: 'No matching results found.',
    noFilterResults: 'No records match the selected filters.',
  },
  dates: {
    utc: 'UTC',
    today: 'Today',
    from: 'From',
    to: 'To',
    created: 'Created',
    updated: 'Updated',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  },
};

Object.assign(en.navigation, { shifts: 'Shift Management' });
en.shifts = {
  title: 'Shift Management',
  add: 'Add Shift',
  edit: 'Edit Shift',
  create: 'Create Shift',
  created: 'Shift created successfully.',
  updated: 'Shift updated successfully.',
  list: 'Shifts',
  shift: 'Shift',
  name: 'Shift Name',
  startTime: 'Start Time',
  endTime: 'End Time',
  select: 'Select an active shift',
  empty: 'No shifts have been created yet.',
};
Object.assign(en.validation, { shiftRequired: 'Select an active shift.' });
Object.assign(en.apiErrors || (en.apiErrors = {}), {
  SHIFT_NOT_FOUND: 'Shift was not found.',
  SHIFT_INACTIVE: 'Select an active shift.',
  SHIFT_NAME_EXISTS: 'A shift with this name already exists.',
  INVALID_SHIFT_TIME: 'Shift end time must be after start time.',
});

Object.assign(en.validation, {
  loginIdRequired: 'Enter your login ID.',
  activeBranchRequired: 'Select an active branch.',
  activeClassRequired: 'Select an active class.',
  attendanceDate: 'Enter the attendance date in YYYY-MM-DD format.',
  checkInIso: 'Enter a valid ISO check-in time.',
  checkOutIso: 'Enter a valid ISO check-out time.',
  checkOutOrder: 'Check-out cannot be before check-in.',
  completeCheckOut: 'Complete attendance requires a check-out time.',
  incompleteCheckOut: 'Incomplete attendance cannot contain a check-out time.',
  correctionReason:
    'Correction reason must contain between 5 and 500 characters.',
});
Object.assign(en.teachers, { timing: 'Timing (12-hour AM/PM)' });
Object.assign(en.attendance, {
  checkInClosed: 'Check-in is closed because the shift has ended.',
  checkOutClosed: 'Check-out closed 30 minutes after the shift ended. Contact the Super Admin for a correction.',
  checkInAvailable: 'Check-in is available now.',
  checkInOpensIn: 'Check-in opens in {count} minutes.',
  missingTiming:
    'Attendance timing is not configured. Contact the Super Admin.',
  lateMinutes: 'Late by {count} minutes',
});
Object.assign(en.payroll, {
  lateGraceMinutes: 'Allowed grace minutes',
  lateCountRule: 'Late minutes per deduction unit',
});
Object.assign(en.salaries, { lateMinutes: 'Late minutes' });
Object.assign(en.validation, {
  timing: 'Enter timing like 08:00 AM-02:00 PM.',
  lateGraceMinutes: 'Grace minutes must be between 0 and 180.',
});
Object.assign(en.apiErrors || (en.apiErrors = {}), {
  CHECK_IN_CLOSED: 'Check-in is not allowed after the shift end time.',
  CHECK_OUT_CLOSED: 'Check-out is not allowed more than 30 minutes after the shift end time.',
  CHECK_IN_TOO_EARLY: 'Check-in opens 20 minutes before arrival time.',
  MISSING_TIMING: 'Attendance timing is not configured.',
});
Object.assign(en.students, {
  saved: 'Student saved',
  createdMessage: 'A new Student was added.',
  updatedMessage: 'Student details were updated.',
  unknownBranch: 'Unknown Branch',
  unknownClass: 'Unknown Class',
});
Object.assign(en.attendance, {
  todayTitle: "Today's Attendance (institution time)",
  institutionTime: 'Institution time',
  onLeave: 'On Leave',
  onLeaveMessage: 'You are on approved leave today.',
  correctionUnavailable: 'Attendance correction is not available yet.',
  adminSummary:
    '{total} records | {complete} complete | {worked} worked on this page',
  exportTitle: 'SmartHazri Attendance Report',
});

Object.assign(en.auth, {
  loginId: 'Login ID',
  loginIdPlaceholder: 'teacher001',
  forgotHelp: 'If you forgot your password, contact the Super Admin.',
  passwordChangedMessage: 'Your password was changed. Please log in again.',
});
en.apiErrors = {
  INVALID_ROLE: 'This account does not have a supported role.',
  INVALID_CREDENTIALS: 'Login ID or password is incorrect.',
  ACCOUNT_INACTIVE: 'This account is inactive. Contact the Super Admin.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_REFRESH_TOKEN:
    'Your session is no longer valid. Please log in again.',
  INVALID_TOKEN: 'Your session is no longer valid. Please log in again.',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect.',
  PASSWORDS_DO_NOT_MATCH: 'New password and confirmation do not match.',
  PASSWORD_UNCHANGED: 'New password must differ from the current password.',
  WEAK_PASSWORD:
    'Use at least 8 characters with uppercase, lowercase and a number.',
  VALIDATION_ERROR: 'Please check the entered information.',
  NETWORK_ERROR: 'Check your internet connection and try again.',
  INTERNAL_ERROR:
    'The server could not complete the request. Please try again.',
};
Object.assign(en.navigation, {
  dashboard: 'Dashboard',
  attendance: 'Attendance',
  checkInOut: 'Check In / Check Out',
  attendanceHistory: 'Attendance History',
  leaveRequest: 'Leave Request',
  leaveHistory: 'Leave History',
  changePassword: 'Change Password',
  salaries: 'Salaries',
  settings: 'Settings',
});
Object.assign(en.common, {
  next: 'Next',
  previous: 'Previous',
  pageOf: 'Page {page} of {total}',
});
Object.assign(en.branches, {
  namePlaceholder: 'Main Campus',
  codePlaceholder: 'MAIN-01',
  contactPlaceholder: '+92 300 1234567',
});
Object.assign(en.apiErrors, {
  AUTH_REQUIRED: 'Please log in to continue.',
  FORBIDDEN: 'You are not authorized to manage branches.',
  BRANCH_NOT_FOUND: 'The requested branch was not found.',
  BRANCH_CODE_EXISTS: 'A branch with this code already exists.',
  DATABASE_CONFLICT: 'This branch conflicts with an existing record.',
});
Object.assign(en.classes, {
  namePlaceholder: 'Grade One',
});
Object.assign(en.teachers, {
  loginId: 'Login ID',
  emailOptional: 'Email (optional)',
  loginIdImmutable: 'Login ID cannot be changed after creation.',
  editLoginId: 'Edit {loginId}',
  saved: 'Teacher saved',
  createdMessage: 'A new Teacher account was created.',
  updatedMessage: 'Teacher details were updated.',
  resetFor: 'Set a new password for {name}.',
  passwordResetComplete: 'Password reset complete',
  passwordResetMessage:
    'The Teacher password was reset and all existing sessions were signed out.',
});
Object.assign(en.dates, { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' });
Object.assign(en.validation, {
  loginIdFormat:
    'Login ID must contain 2-100 letters, numbers, dots, hyphens or underscores.',
});
Object.assign(en.apiErrors, {
  FORBIDDEN: 'You are not authorized to perform this action.',
  CLASS_NOT_FOUND: 'The requested class was not found.',
  CLASS_NAME_EXISTS:
    'A class with this name already exists in the selected branch.',
  BRANCH_INACTIVE: 'Select an active branch for this class.',
  TEACHER_NOT_FOUND: 'The requested Teacher was not found.',
  TEACHER_LOGIN_ID_EXISTS: 'This login ID is already in use.',
  TEACHER_EMAIL_EXISTS: 'This email address is already in use.',
  CLASS_INACTIVE: 'Select an active class for this Teacher.',
  CLASS_BRANCH_MISMATCH: 'The selected class does not belong to this branch.',
  STUDENT_NOT_FOUND: 'The requested Student was not found.',
  ADMISSION_NO_EXISTS: 'This admission number is already in use.',
  ALREADY_CHECKED_IN: "Today's check-in is already recorded.",
  ALREADY_CHECKED_OUT: "Today's check-out is already recorded.",
  CHECK_IN_REQUIRED: 'Check in before checking out.',
  TEACHER_ASSIGNMENT_INCOMPLETE:
    'Your branch or class assignment is incomplete. Contact the Super Admin.',
  MISSING_TIMING: 'Your attendance timing is missing. Contact the Super Admin.',
  TEACHER_ON_LEAVE: 'You are on approved leave today.',
  INVALID_DATE: 'The attendance date is invalid.',
  INVALID_DATE_RANGE: 'The attendance start date cannot be after the end date.',
  ATTENDANCE_NOT_FOUND: 'The requested attendance record was not found.',
  CORRECTION_REASON_REQUIRED: 'Enter a reason for this correction.',
  INVALID_TIMESTAMP: 'Enter valid ISO timestamps including a timezone.',
  CHECK_OUT_BEFORE_CHECK_IN: 'Check-out cannot be before check-in.',
  INVALID_STATUS_COMBINATION:
    'The times, late status, and attendance status do not match.',
  ATTENDANCE_CHANGED_RETRY:
    'This attendance record changed. Refresh and try again.',
});
Object.assign(en.attendance, {
  present: 'Present',
  correctionSavedMessage: 'The correction and its audit history were saved.',
});
Object.assign(en.validation, {
  correctionReason:
    'Correction reason is required and cannot exceed 500 characters.',
  checkInIso: 'Enter a valid check-in ISO timestamp including a timezone.',
  checkOutIso: 'Enter a valid check-out ISO timestamp including a timezone.',
  checkOutOrder: 'Check-out cannot be before check-in.',
  presentAttendance:
    'Present attendance requires check-in, check-out, and late status.',
  incompleteAttendance:
    'Incomplete attendance requires check-in, no check-out, and late status.',
  onLeaveAttendance:
    'On-leave attendance cannot contain times or a late status.',
});

Object.assign(en.reports, {
  details: 'Report Details',
  viewDetails: 'View Details',
  minutesRemaining: '{count} minutes remaining to edit',
  exportFailed: 'CSV report could not be exported',
});
Object.assign(en.apiErrors, {
  REPORT_NOT_FOUND: 'The requested report was not found.',
  REPORT_ALREADY_EXISTS: 'A report already exists for this Teacher and period.',
  REPORT_EDIT_EXPIRED: 'The 30-minute edit window has expired.',
  REPORT_EDIT_NOT_ALLOWED: 'Your staff role cannot edit this report.',
  INVALID_REPORT_PERIOD: 'The selected report period is invalid.',
  SUPERVISOR_WEEKLY_REPORT_ONLY: 'Supervisors can submit Weekly Reports only.',
  REPORT_CREATION_NOT_ALLOWED: 'Your staff designation cannot submit reports.',
  WEEKLY_IJARA_CONFIGURATION_REQUIRED: 'Weekly Ijara amount and working days are required.',
});
Object.assign(en.leaveRequests, {
  startDate: 'Start date (YYYY-MM-DD)',
  endDate: 'End date (YYYY-MM-DD)',
  dateFilter: 'Date filter (YYYY-MM-DD)',
});
Object.assign(en.validation, {
  leaveReason: 'Leave reason is required and cannot exceed 1,000 characters.',
});
Object.assign(en.apiErrors, {
  LEAVE_REQUEST_NOT_FOUND: 'The requested leave request was not found.',
  LEAVE_REQUEST_OVERLAP:
    'An overlapping pending or approved leave request already exists.',
  LEAVE_REQUEST_ALREADY_REVIEWED:
    'This leave request has already been reviewed.',
  INVALID_LEAVE_DATE: 'Enter a valid leave date in YYYY-MM-DD format.',
  INVALID_LEAVE_RANGE: 'Leave end date cannot be before its start date.',
  LEAVE_RANGE_TOO_LONG: 'A leave request cannot exceed 366 days.',
});
Object.assign(en.payroll, {
  absentDeductionType: 'Absence deduction type',
  absentDeductionValue: 'Absence deduction value',
  lateDeductionType: 'Late deduction type',
  lateDeductionValue: 'Late deduction value',
  workingDaysMode: 'Working days mode',
  lateCountRule: 'Late count rule',
  minimumSalaryAllowed: 'Minimum salary allowed',
  timezone: 'Institution timezone',
  invalid: 'Payroll settings are invalid',
  savedMessage: 'Payroll settings were saved.',
  saveFailed: 'Payroll settings could not be saved',
});
Object.assign(en.salaries, {
  breakdown: 'Salary Breakdown',
  absentDeduction: 'Absence deduction',
  lateDeduction: 'Late deduction',
  otherAdjustment: 'Other adjustment',
  daysBreakdown:
    'Working: {working} | Present: {present} | Absent: {absent} | Leave: {leave} | Late: {late}',
  calculationVersion: 'Calculation version',
  results: 'Salary Records ({count})',
  empty: 'No salary records matched the selected period and filters.',
  loadFailed: 'Salary records could not be loaded',
  invalidPeriod: 'Salary period is invalid',
});
en.dates.months = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
};
Object.assign(en.validation, {
  payrollIdentifier:
    'Deduction types and working-days mode must use uppercase identifier values.',
  payrollMoney:
    'Enter non-negative salary amounts with no more than two decimal places.',
  lateCountRule: 'Late count rule must be a whole number from 1 to 365.',
  timezone: 'Enter a valid institution timezone.',
  salaryMonth: 'Select a valid salary month.',
  salaryYear: 'Enter a valid four-digit salary year.',
});
Object.assign(en.apiErrors, {
  PAYROLL_SETTINGS_MISSING:
    'Complete payroll settings have not been configured.',
  INVALID_TIMEZONE: 'Enter a valid IANA institution timezone.',
  SALARY_NOT_FOUND: 'The requested salary record was not found.',
});
Object.assign(en.payroll, { allowNegativeSalary: 'Allow negative salary' });
Object.assign(en.salaries, {
  calculate: 'Calculate Salaries',
  calculateConfirm:
    'Calculate salaries for {month} {year}? Existing records will be recalculated.',
  calculated: 'Salaries calculated',
  calculatedMessage:
    'Processed: {processed} | Created: {created} | Recalculated: {recalculated} | Skipped: {skipped}',
  calculateFailed: 'Salary calculation failed',
});
Object.assign(en.apiErrors, {
  PAYROLL_POLICY_UNSUPPORTED:
    'Payroll settings contain an unsupported calculation policy.',
});
Object.assign(en.settings, {
  languageHelp:
    'Choose the language used for navigation, forms, validation and messages.',
  languageAccessibilityHint: 'Changes the application language immediately.',
  languageOption: 'Select {language}',
  appInformation: 'App Information',
  appDescription: 'Bilingual Madarsa management and attendance application.',
  version: 'Version {version}',
});
Object.assign(en.dialogs, {
  logoutTitle: 'Log out?',
  logoutMessage: 'Are you sure you want to log out of SmartHazri?',
});
Object.assign(en.branches, { contact: 'Contact' });
Object.assign(en.common, { appName: 'SmartHazri', appMark: 'SH' });
Object.assign(en.branches, {
  classesAtCreation: 'Classes in this branch',
  classNumber: 'Class {number}',
  classPlaceholder: 'Enter class name',
  addAnotherClass: 'Add another class',
  classCount: 'Total classes',
  assignedClasses: 'Classes',
  noClasses: 'No classes are assigned to this branch.',
});
Object.assign(en.validation, {
  branchClassName: 'Enter at least two characters for every class.',
  branchClassDuplicate: 'Class names must be unique within the branch.',
});
Object.assign(en.teachers, {
  designation: 'Designation',
  teacherType: 'Teacher',
  supervisorType: 'Supervisor',
  muawinType: 'Muawin',
  khadimType: 'Khadim',
  allDesignations: 'All designations',
  monthlyAllowance: 'Monthly allowance',
  workingDays: 'Working days',
  profileImageUrl: 'Profile image URL',
  ijaraTerms: 'Ijara terms',
  ijaraTermsVersion: 'Ijara terms version',
  acceptIjaraTerms: 'Accept Ijara terms',
  ijaraAccepted: 'Ijara terms accepted',
  ijaraFrequency: 'Ijara frequency',
  monthlyIjara: 'Monthly',
  weeklyIjara: 'Weekly',
  weeklyIjaraAmount: 'Weekly Ijara amount',
  agreedIjaraAmount: 'Agreed Ijara amount',
  offDays: 'Off days',
  attendanceAllowance: 'Attendance Allowance',
  conveyanceAllowance: 'Conveyance Allowance',
  medicalAllowance: 'Medical Allowance',
  otherAllowance: 'Other Allowance',
  applyAttendanceAllowance: 'Apply attendance allowance',
});
Object.assign(en.validation, {
  teacherType: 'Select a valid Teacher designation.',
  allowance: 'Enter a valid non-negative allowance.',
  ijaraFrequency: 'Select a valid Ijara frequency.',
  weeklyIjaraAmount: 'Enter a valid weekly Ijara amount.',
  workingDaysRequired: 'Select at least one working day.',
});
en.dailyPerformance = {
  title: 'Daily Performance Form',
  arrivalTime: 'Arrival time',
  departureTime: 'Departure time',
  teachingMethod: 'Teaching method / lesson plan',
  totalStudents: 'Total students',
  presentStudents: 'Present students',
  absentStudents: 'Absent students',
  leaveStudents: 'Students on leave',
  lessonMemorizedCount: 'Students who memorized the lesson',
  revisionRecitationCount: 'Students who recited revision/rules',
  studentsNeedingLessonAttention: 'Students needing attention in lesson',
  studentsNeedingRulesAttention: 'Students needing attention in rules/revision',
  longAbsentContactCount: 'Long-absent students whose family was contacted',
  visitingTeacherName: 'Visiting/substitute teacher name',
  remarks: 'Remarks',
  summary: 'Present: {present} / Total: {total}',
};
Object.assign(en.common, { appName: 'مدرسہ فاروقیہ', appMark: 'م ف' });
Object.assign(en.auth, { loginTitle: 'مدرسہ فاروقیہ' });
Object.assign(en.dashboard, { loading: 'مدرسہ فاروقیہ loading...' });
Object.assign(en.dialogs, {
  logoutMessage: 'Are you sure you want to log out of مدرسہ فاروقیہ?',
});
Object.assign(en.teachers, {
  assignedBranches: 'Assigned Supervisor branches',
});
Object.assign(en.validation, {
  supervisorBranchRequired: 'Select at least one branch for the Supervisor.',
});
en.teacherAccess = {
  myStudents: 'My Students',
  myProfile: 'My Profile',
  mySalary: 'My Salary',
  noAssignedStudents: 'No active students are assigned to your class.',
  noSalary: 'No salary was calculated for the selected month.',
  deductionReason: 'Deduction reason',
  attendancePolicy: 'Attendance and payroll policy',
};
Object.assign(en.salaries, { finalSalary: 'Final Salary' });
Object.assign(en.salaries, { grossAmount: 'Total / Gross Amount' });
en.onboarding = { imageTitle: 'Upload Profile Image', termsTitle: 'Ijara Terms & Conditions', stepOne: 'Step 1 of 2', stepTwo: 'Step 2 of 2', imagePlaceholder: 'Profile image required', chooseImage: 'Choose profile image', imageHelp: 'JPEG, PNG or WebP. Maximum size 2 MB.', imageSelectionFailed: 'Image could not be selected.', invalidImage: 'Select a valid profile image.', imageTooLarge: 'Profile image must not exceed 2 MB.', continue: 'Accept and continue', allMustBeYes: 'All Ijara conditions must be answered Yes to continue.', requireOnboarding: 'Require first-login onboarding' };
Object.assign(en.validation, { ijaraConditionsRequired: 'Enter at least one Ijara condition, one condition per line.', ijaraTermsVersionRequired: 'Ijara terms version is required.' });

Object.assign(en.reports, {
  shareReport: 'Share Report',
  exportImage: 'Export as Image',
  exportPdf: 'Export as PDF',
  generatingExport: 'Generating report file...',
  exportFailedTitle: 'Export failed',
  exportGenerationFailed: 'The report file could not be generated or shared. Please try again.',
  exportDocumentTitle: 'Report',
  exportDateOrWeek: 'Date / Week',
  exportStaffName: 'Staff name',
  exportStaffRole: 'Staff role',
  exportAdmin: 'Super Admin',
  generatedAt: 'Generated date',
  generatedByInstitution: 'Generated by the Madarsa management application',
});
Object.assign(en.apiErrors, { ONBOARDING_REQUIRED: 'Complete first-login onboarding to continue.', PROFILE_IMAGE_REQUIRED: 'Upload a profile image first.', PROFILE_IMAGE_SIZE_INVALID: 'Profile image must not exceed 2 MB.', PROFILE_IMAGE_FORMAT_INVALID: 'Only valid JPEG, PNG and WebP images are allowed.', INVALID_PROFILE_IMAGE: 'Profile image is invalid.', IJARA_CONDITIONS_NOT_CONFIGURED: 'Ijara conditions are not configured.', ALL_IJARA_ANSWERS_REQUIRED: 'Answer every Ijara condition.', ALL_IJARA_TERMS_MUST_BE_ACCEPTED: 'All Ijara conditions must be accepted to continue.' });
en.inspection = {
  title: 'Weekly Inspection',
  weeklyForm: 'Weekly Inspection Form',
  supervisorName: 'Supervisor name',
  date: 'Inspection date (YYYY-MM-DD)',
  visitNumber: 'Visit number',
  arrivalTime: 'Arrival time',
  departureTime: 'Departure time',
  remarks: 'Remarks',
  submit: 'Submit Inspection',
  previous: 'Previous Inspections',
  empty: 'No inspections have been submitted.',
  invalid: 'Incomplete form',
  completeAll: 'Select branch, class, Teacher and answer every question.',
  saved: 'Inspection submitted',
  savedMessage: 'The weekly inspection was saved.',
  saveFailed: 'Inspection could not be submitted',
  loadFailed: 'Inspection data could not be loaded',
  questions: {
    q1: 'Is the attendance register in proper condition?',
    q2: 'Is the timetable being followed?',
    q3: 'Are discipline and seating arrangements proper?',
    q4: 'Is classroom etiquette being observed?',
    q5: 'Is the classroom cleanliness satisfactory?',
    q6: 'Is the Teacher personally listening to lessons?',
    q7: 'Is the Teacher punctual for duty?',
    q8: 'Are children physically punished?',
    q9: 'Is the Teacher attentive to the class?',
    q10: 'Is the Teacher satisfied with this inspection?',
  },
};
Object.assign(en.apiErrors, {
  SUPERVISOR_ONLY: 'This module is available only to Supervisors.',
  BRANCH_NOT_ASSIGNED: 'This branch is not assigned to you.',
  INSPECTION_TEACHER_MISMATCH:
    'The selected Teacher does not belong to this class.',
  INSPECTION_NOT_FOUND: 'The inspection was not found.',
});
Object.assign(en.navigation, {
  menu: 'Navigation menu',
  openMenu: 'Open navigation menu',
  closeMenu: 'Close navigation menu',
});
Object.assign(en.common, { delete: 'Delete' });
Object.assign(en.students, {
  deleteTitle: 'Delete Student?',
  deleteMessage:
    'Delete {name}? The record will be deactivated and history will be preserved.',
  deleted: 'Student deleted',
  deletedMessage: 'The Student record was deactivated.',
  deleteFailed: 'Student could not be deleted',
});
Object.assign(en.navigation, { holidays: 'Holidays' });
en.holidays = {
  title: 'Holidays', add: 'Add Holiday', edit: 'Edit Holiday', create: 'Create Holiday', list: 'Holiday Calendar', details: 'Holiday Details',
  dateType: 'Date selection', singleDate: 'Single date', dateRange: 'Date range', startDate: 'Start date', endDate: 'End date', datePlaceholder: 'YYYY-MM-DD',
  holidayTitle: 'Holiday title / reason', description: 'Description / instructions (optional)', attendanceEffect: 'Attendance calculation',
  excludeAttendance: 'Exclude from attendance and working days', informationOnly: 'Information only — attendance remains required',
  attendanceHelp: 'When excluded, this date is not counted as an absence or salary working day.', searchPlaceholder: 'Search title or description',
  createdBy: 'Created by', empty: 'No holidays matched the selected filters.', created: 'Holiday created.', updated: 'Holiday updated.',
  invalidForm: 'Enter a title and a valid date or date range.', confirmTitle: 'Change holiday status?', confirmMessage: 'The record and history will remain saved.',
};
Object.assign(en.attendance, { holidayToday: 'Today is a holiday: {title}. Attendance is not required.' });
Object.assign(en.apiErrors, { HOLIDAY_NOT_FOUND: 'Holiday was not found.', HOLIDAY_DATE_RANGE_INVALID: 'Holiday start date cannot be after end date.', ATTENDANCE_HOLIDAY: 'Attendance is not required on this holiday.' });
Object.assign(en.common, { superAdmin: 'Mufti Tanveer Hussain', superAdminName: 'Mufti Tanveer Hussain' });
Object.assign(en.navigation, { superAdminPanel: 'Mufti Tanveer Hussain' });
Object.assign(en.leaveRequests, { reviewedBy: 'Reviewed by' });
Object.assign(en.status, { submitted: 'Submitted' });
Object.assign(en.reports, {
  dailyReports: 'Daily Reports', weeklyReports: 'Weekly Reports', weekFilter: 'Week', personRole: 'Role',
  roleTeacher: 'Teacher', roleSupervisor: 'Supervisor', roleMuawin: 'Muawin', roleKhadim: 'Khadim', originalCreator: 'Original creator',
  originalReportDate: 'Original report date', lastEditedBy: 'Last edited by', editHistory: 'Edit history',
});
en.intro = {
  skip: 'Skip',
  previous: 'Previous',
  next: 'Next',
  getStarted: 'Get Started',
  pageIndicator: 'Slide {current} of {total}',
  slides: {
    studentsTitle: 'Learning with purpose',
    studentsDescription: 'Nurturing students through Quranic education, character building and care.',
    studentSectionTitle: 'Education for every student',
    studentSectionDescription: 'A welcoming environment where students learn, grow and build strong values.',
    leadershipTitle: 'Guided by dedicated leadership',
    leadershipDescription: 'Supporting Madarsa Farooqia with commitment, discipline and responsible management.',
  },
};
export default en;
