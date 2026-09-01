import React from 'react';
import AppButton from './AppButton';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof AppButton>, 'variant'>;

export function SecondaryButton(props: Props) {
  return <AppButton {...props} variant="outline" />;
}

export default SecondaryButton;

