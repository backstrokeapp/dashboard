import * as React from 'react';
import './styles.css';

export default function Login({
  name,
}) {
  return <div className="login">
    {name ? `Hello ${name}` : 'Hello World!'}
  </div>;
}
