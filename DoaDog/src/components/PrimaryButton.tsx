import React from 'react';
import AppButton from './AppButton';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof AppButton>, 'variant'>;

export function PrimaryButton(props: Props) {
  return <AppButton {...props} variant="primary" />;
}

export default PrimaryButton;

