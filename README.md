# SmartHazri

SmartHazri is a bilingual React Native Madarsa Management application. The
mobile app uses the separate Node.js/Express REST backend, MySQL, Prisma, JWT
authentication, and secure native token storage.

## Implemented modules

- Super Admin and Teacher authentication with session restore and token refresh
- English (LTR) and Urdu (RTL) localization with persistent language selection
- Branch, class, Teacher, and student management
- Teacher password reset and change-password flows
- Teacher check-in/check-out, history, admin filters, and attendance correction
- Daily, weekly, and monthly reports with CSV export
- Teacher leave requests and Super Admin review
- Payroll settings and monthly salary calculation/viewing

All privileged operations are authorized by the backend. Attendance dates,
lateness, report windows, leave processing, and salary calculations use the
configured institution timezone; persisted timestamps are UTC.

## Requirements

- Node.js 22.11 or newer
- Android Studio with Android SDK 36 and JDK 17
- A running SmartHazri REST API (the sibling `BackendCode` project)
- macOS with Xcode and CocoaPods for iOS builds

## Configuration

Copy `.env.example` to an environment-specific `.env` and set the REST API base
URL and institution timezone. Never commit environment files or credentials.

For an Android emulator, the API host is commonly `10.0.2.2`; physical devices
must use an address reachable from the device.

## Install and run

```sh
npm install
npm start
npm run android
```

For iOS on macOS:

```sh
cd ios
bundle install
bundle exec pod install
cd ..
npm run ios
```

## Verify

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run apk:debug
```

The Android debug APK is generated at:

`android/app/build/outputs/apk/debug/app-debug.apk`

## Android release signing

Create an upload keystore outside the repository and set:

```text
SMART_HAZRI_UPLOAD_STORE_FILE
SMART_HAZRI_UPLOAD_STORE_PASSWORD
SMART_HAZRI_UPLOAD_KEY_ALIAS
SMART_HAZRI_UPLOAD_KEY_PASSWORD
```

Then run:

```sh
npm run apk:release
```

## Security boundary

The mobile client does not decide user identity, role, ownership, attendance
time, salary rules, or audit metadata. It sends JWT-authenticated REST requests;
the backend validates authorization and business rules and returns safe response
objects without password hashes.

The one-time legacy data migration tooling is backend-only. Follow
`BackendCode/docs/firebase-migration.md`, create external source and MySQL
backups, run dry-run first, and never place a service account in this repository.
