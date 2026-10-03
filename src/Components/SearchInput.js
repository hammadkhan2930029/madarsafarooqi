import React from 'react';
import CustomInput from './CustomInput';
import { useTranslation } from '../localization/i18n';

const SearchInput = props => {
  const { t } = useTranslation();
  return (
    <CustomInput autoCapitalize="none" label={t('common.search')} {...props} />
  );
};
export default SearchInput;
