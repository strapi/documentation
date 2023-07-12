import React from 'react';
import clsx from 'clsx';
import styles from './form-field-input.module.scss';

export function FormFieldInput({
  as: Component = 'input',
  className,
  ...rest
}) {
  return (
    <Component
      {...rest}
      className={clsx(
        styles['form-field__input'],
        styles[`form-field__input--${Component}`],
        className,
      )}
    />
  );
}

FormFieldInput.defaultProps = {
  type: 'text',
};
