import { Platform } from 'react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const fileUrl = path =>
  path?.startsWith('file://') || path?.startsWith('content://')
    ? path
    : `file://${path}`;

const safeFileName = report =>
  `report-${String(report.report_type || 'report')}-${String(
    report.originalReportDate || report.reportDate || report.id,
  ).replace(/[^a-zA-Z0-9-]/g, '-')}`;

const captureOptions = {
  format: 'png',
  quality: 1,
};

export const shareReportImage = async (viewRef, report, title) => {
  const uri = await captureRef(viewRef.current, {
    ...captureOptions,
    result: 'tmpfile',
  });
  await Share.open({
    failOnCancel: false,
    title,
    type: 'image/png',
    url: fileUrl(uri),
    filename: `${safeFileName(report)}.png`,
  });
};

export const shareReportPdf = async (viewRef, report, title) => {
  const image = await captureRef(viewRef.current, {
    ...captureOptions,
    result: 'base64',
  });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { margin: 18px; } html, body { margin: 0; padding: 0; }
    img { display: block; width: 100%; height: auto; }
  </style></head><body><img alt="report" src="data:image/png;base64,${image}" /></body></html>`;
  const result = await generatePDF({
    html,
    fileName: safeFileName(report),
    directory: Platform.OS === 'android' ? 'Documents' : undefined,
  });
  if (!result?.filePath) throw new Error('REPORT_PDF_GENERATION_FAILED');
  await Share.open({
    failOnCancel: false,
    title,
    type: 'application/pdf',
    url: fileUrl(result.filePath),
    filename: `${safeFileName(report)}.pdf`,
  });
};
