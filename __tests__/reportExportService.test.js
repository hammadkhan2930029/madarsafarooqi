import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

import {
  shareReportImage,
  shareReportPdf,
} from '../src/Services/reportExportService';

const report = {
  id: '7',
  report_type: 'weekly',
  originalReportDate: '2026-09-07',
};
const viewRef = { current: { native: true } };

describe('report file export', () => {
  beforeEach(() => jest.clearAllMocks());

  test('captures and shares an image through a temporary private file', async () => {
    captureRef.mockResolvedValue('/tmp/report.png');
    Share.open.mockResolvedValue({ success: true });
    await shareReportImage(viewRef, report, 'Share Report');
    expect(captureRef).toHaveBeenCalledWith(
      viewRef.current,
      expect.objectContaining({ format: 'png', result: 'tmpfile' }),
    );
    expect(Share.open).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'image/png', url: 'file:///tmp/report.png' }),
    );
  });

  test('uses the rendered image inside PDF so Urdu shaping is preserved', async () => {
    captureRef.mockResolvedValue('base64-image');
    generatePDF.mockResolvedValue({ filePath: '/tmp/report.pdf' });
    Share.open.mockResolvedValue({ success: true });
    await shareReportPdf(viewRef, report, 'Share Report');
    expect(generatePDF).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.stringContaining('base64-image') }),
    );
    expect(Share.open).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'application/pdf', url: 'file:///tmp/report.pdf' }),
    );
  });
});
