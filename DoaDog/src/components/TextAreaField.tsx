import React from 'react';
import AppInput from './AppInput';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof AppInput>;

export function TextAreaField(props: Props) {
  return <AppInput {...props} multiline />;
}

export default TextAreaField;

