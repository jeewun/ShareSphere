// frontend/src/components/BrandLogo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Premium BrandLogo component supporting light/dark variants,
 * smooth hover animations, and high-DPI crisp rendering.
 */
export default function BrandLogo({
  variant = 'light', // 'light' (black text for light bg) or 'dark' (white text for dark navbar)
  height = 36,
  className = '',
  to = null,
  alt = 'sphere',
  id = undefined
}) {
  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';

  const imgElement = (
    <img
      src={logoSrc}
      alt={alt}
      className={`brand-logo-img ${className}`}
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        imageRendering: '-webkit-optimize-contrast',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
        filter: variant === 'dark' 
          ? 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))' 
          : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.05))'
      }}
      loading="eager"
    />
  );

  if (to) {
    return (
      <Link
        id={id}
        to={to}
        className={`brand-logo-link d-inline-flex align-items-center text-decoration-none ${
          variant === 'dark' ? 'brand-logo-nav-link' : 'brand-logo-auth-link'
        }`}
        style={{ outline: 'none' }}
      >
        {imgElement}
      </Link>
    );
  }

  return <div id={id} className="d-inline-flex align-items-center">{imgElement}</div>;
}
