import React from 'react';
import clsx from 'clsx';
import styles from './form-field-input.module.scss';

export function FormFieldInput({
  className,
  ...rest
}) {
  return (
    <input
      {...rest}
      className={clsx(
        styles['form-field__input'],
        className,
      )}
    />
  );
}

FormFieldInput.defaultProps = {
  type: 'text',
};
