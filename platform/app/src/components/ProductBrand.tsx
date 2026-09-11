import React from 'react';

/**
 * Product brand lockup for the Zelvyn product shell.
 * Assets live under platform/app/public/assets/zelvyn/.
 * Temporary product name (easy to rename later).
 */
export const BRAND_NAME = 'Zelvyn';
export const BRAND_CODE = 'Zelvyn';

export const LOGO_MARK_SRC = '/assets/zelvyn/logo-mark.png';
export const LOGO_WORDMARK_SRC = '/assets/zelvyn/logo-wordmark.png';

type ProductBrandProps = {
  /** compact = mark only; full = wordmark (mark + name) */
  variant?: 'full' | 'compact';
  className?: string;
  href?: string;
};

export function ProductBrand({
  variant = 'full',
  className = '',
  href = '/',
}: ProductBrandProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-2 no-underline ${className}`}
      aria-label={BRAND_NAME}
      data-brand={BRAND_CODE}
    >
      {variant === 'compact' ? (
        <img
          src={LOGO_MARK_SRC}
          alt=""
          className="h-7 w-7 shrink-0 rounded-md object-contain"
          aria-hidden
        />
      ) : (
        <img
          src={LOGO_WORDMARK_SRC}
          alt={BRAND_NAME}
          className="h-7 max-w-[148px] object-contain object-left"
        />
      )}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <a
      href={href}
      className="hover:opacity-90 focus-visible:ring-ring inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2"
    >
      {content}
    </a>
  );
}

/** OHIF whiteLabeling.createLogoComponentFn factory. */
export function createProductLogoComponent(
  ReactLib: typeof React,
  props?: { compact?: boolean }
) {
  return ReactLib.createElement(ProductBrand, {
    variant: props?.compact ? 'compact' : 'full',
    href: '/',
  });
}

export default ProductBrand;
