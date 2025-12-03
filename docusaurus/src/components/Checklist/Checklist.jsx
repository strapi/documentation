import React, { useState, useId } from 'react';
import clsx from 'clsx';

export function ChecklistItem({ children }) {
  const id = useId();
  const [checked, setChecked] = useState(false);

  return (
    <li className="checklist__item">
      <label className="checklist__label" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          className="checklist__input"
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <span className="checklist__checkbox" aria-hidden="true" />
        <span className="checklist__text">{children}</span>
      </label>
    </li>
  );
}

export default function Checklist({
  title = 'Checklist',
  children,
  className,
  ...rest
}) {
  return (
    <div className={clsx('checklist', className)} {...rest}>
      <div className="checklist__header">{title}</div>
      <ul className="checklist__list" role="list">
        {children}
      </ul>
    </div>
  );
}