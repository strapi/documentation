import React from 'react';

export default function Icon({
  name,
  classes = 'ph-fill',
  color = 'inherit'
}) {

  return (
    <i className={`strapi-icons ${classes} ph-${name}`} style={{color}}></i>
  );
}
