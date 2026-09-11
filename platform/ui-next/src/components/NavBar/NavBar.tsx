import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const stickyClasses = 'sticky top-0';
const notStickyClasses = 'relative';

const NavBar = ({
  className,
  children,
  isSticky,
}: {
  className?: string;
  children?: React.ReactNode;
  isSticky?: boolean;
}) => {
  return (
    <div
      className={classnames(
        'zelvyn-viewer-navbar relative z-20 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-1',
        isSticky && stickyClasses,
        !isSticky && notStickyClasses,
        className
      )}
      data-chrome="zelvyn-viewer-navbar"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[color:var(--accent,#2DD4BF)]/70 to-transparent"
        aria-hidden
      />
      {children}
    </div>
  );
};

NavBar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isSticky: PropTypes.bool,
};

export default NavBar;
