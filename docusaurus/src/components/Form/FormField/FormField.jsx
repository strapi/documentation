import React from 'react';
import clsx from 'clsx';
import styles from './form-field.module.scss';
import { FormFieldHint } from '../FormFieldHint/FormFieldHint';
import { FormFieldInput } from '../FormFieldInput/FormFieldInput';
import { FormFieldLabel } from '../FormFieldLabel/FormFieldLabel';

export function FormField({
  children,
  className,
  id,

  // Optional - Object which contains Input props
  input,

  // Optional - Simple String or an Object which contains 'FormFieldLabel' props
  label,

  // Optional - Simple String or an Object which contains 'FormFieldHint' props
  hint,

  ...rest
}) {
  return (
    <fieldset
      {...rest}
      id={`${id}-wrapper`}
      className={clsx(
        styles['form-field'],
        className,
      )}
    >
      {label && (
        <FormFieldLabel
          id={`${id}-label`}
          htmlFor={id}
          {...((typeof label === 'object') ? label : { children: label })}
        />
      )}
      {input && (
        <FormFieldInput
          id={id}
          {...input}
        />
      )}
      {children}
      {hint && (
        <FormFieldHint
          id={`${id}-hint`}
          htmlFor={id}
          {...((typeof hint === 'object') ? hint : { children: hint })}
        />
      )}
    </fieldset>
  );
}
