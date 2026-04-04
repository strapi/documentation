import React from 'react';
import styles from './api-reference.module.scss';
import clsx from 'clsx';

const METHOD_MAP = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'del',
  DEL: 'del',
  PATCH: 'patch',
};

export default function MethodPill({ method = 'GET' }) {
  const key = METHOD_MAP[method.toUpperCase()] || 'get';
  return (
    <span className={clsx(styles.methodPill, styles[`methodPill--${key}`])}>
      {method.toUpperCase() === 'DELETE' ? 'DEL' : method.toUpperCase()}
    </span>
  );
}
