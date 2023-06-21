import React from 'react';
import clsx from 'clsx';
import styles from './form-field-hint.module.scss';

export function FormFieldHint({
  className,
  ...rest
}) {
  return (
    <label
      {...rest}
      className={clsx(
        styles['form-field__hint'],
        className,
      )}
    />
  );
}
