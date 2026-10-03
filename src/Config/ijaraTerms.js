export const IJARA_TERMS_VERSION = '2026-10-01';

export const IJARA_TERMS_UR = [
  'مدرسے کے تمام اصولوں کا پابند ہونا لازمی ہے۔',
  'غیر اخلاقی وغیرہ شرعی عادات سے بچنا لازمی ہے۔',
  'دورانِ اجارہ عمامہ شلوار قمیض جیسا مہذب لباس پہننا لازمی ہے، صرف ٹوپی ناکافی ہے۔',
  'معلمات کا پردہ ہونا اور باحیاء ہونا شرط ہے۔',
  'دورانِ اجارہ موبائل کا استعمال پر پابندی ہے، موبائل کا استعمال کرتے ہوئے دیکھنے پر کٹوتی ہو سکتی ہے۔',
  'وقت کی پابندی ضروری ہے، اجارے کے وقت میں تاخیر ہونے پر کٹوتی کی جائے گی۔',
  'حاضری الاؤنس مکمل حاضری والوں کیلئے ہے۔',
  'بغیر بتائے چھٹی کرنے والے پر الاؤنس واجارہ دونوں کی کٹوتی ہوگی۔',
  'بتا کر صرف ایک چھٹی کی گنجائش ہے۔ جس میں صرف الاؤنس ہی کٹے گا۔',
  'مہتمم صاحب، ناظم صاحب اور صدر مدرس و مفتش کی تکریم و اطاعت لازمی ہے۔',
  'بچوں کو مارنے کی ہرگز اجازت نہیں ہے، خلاف ورزی کرنے پر ادارہ ذمہ دار نہیں ہوگا، معلم/معلمہ کو سرپرست و قانون کا خود سامنا کرنا ہوگا۔',
  'ادارے کے ہر چھوٹے بڑے پروگرام میں شرکت اور اس کی تیاری معلم/معلمہ کی ذمہ داری ہے۔',
  'سالانہ بونس/سالانہ چھٹیاں یا اس کا معاوضہ اجارے میں شامل نہیں ہے۔',
  'مستقل لاپروائی اور غیر ذمہ داری کی صورت میں اجارہ منسوخ کر دیا جائے گا۔',
  'مدتِ اجارہ میں بیچ میں چھوڑ کے جانے پر کوئی بقایا واجبات ادا نہیں ہونگے۔',
  'چھوڑ کر جانے کیلئے پیشگی ایک ماہ پہلے بتانا لازمی ہے یا اپنا نعم البدل دے کر جائے۔',
  'طویل رخصت پر جانے کے لیے اپنا نعم البدل دینا لازمی ہوگا، اس کے برعکس اجارہ منسوخ ہوگا۔',
  'دورانِ اجارہ قرآن خوانی/میلاد محفل میں شرکت کی اجازت نہیں ہے۔',
  'درجہ میں موجود مدرسہ کے اثاثے (ڈیکس، بکس، رجسٹر وغیرہ) معلم/معلمہ کے پاس امانت ہے، اس کی حفاظت کی ذمہ داری اجیر پر ہے۔',
];

export const IJARA_TERMS_EN = [
  'Compliance with all Madarsa rules is mandatory.',
  'Unethical and un-Islamic habits must be avoided.',
  'A respectable dress such as a turban, shalwar and qameez must be worn during employment; wearing only a cap is not sufficient.',
  'Female teachers must observe purdah and maintain modesty.',
  'Mobile phone use is prohibited during duty; a deduction may be made if a phone is used.',
  'Punctuality is mandatory; lateness during assigned duty hours may result in a deduction.',
  'Attendance allowance is available only for complete attendance.',
  'An uninformed absence may result in deductions from both the allowance and Ijara.',
  'Only one informed leave is allowed, with a deduction from the allowance only.',
  'Respect and obedience toward the Mohtamim, Nazim, Head Teacher and Supervisor are mandatory.',
  'Hitting children is strictly prohibited; the institution will not be responsible for a violation, and the teacher will personally face the guardian and legal process.',
  'Participation in and preparation for every small or large institution programme is the teacher’s responsibility.',
  'Annual bonus, annual holidays or compensation for them are not included in the Ijara.',
  'Continuous negligence or irresponsibility may result in termination of the Ijara.',
  'Leaving work partway through the agreed Ijara period means no outstanding dues will be paid.',
  'One month’s advance notice or a suitable replacement is required before leaving.',
  'A suitable replacement is mandatory before taking extended leave; otherwise, the Ijara may be terminated.',
  'Participation in Quran recitations or Milad gatherings during duty hours is not permitted.',
  'Madarsa assets in the class, including desks, books and registers, are entrusted to the teacher, who is responsible for their protection.',
];

export const getDefaultIjaraTerms = language =>
  (language === 'ur' ? IJARA_TERMS_UR : IJARA_TERMS_EN).join('\n');
