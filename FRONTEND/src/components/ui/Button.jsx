import { Link } from 'react-router-dom';

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS = {
  primary:
    'bg-accent-500 hover:bg-accent-600 text-text-primary shadow-lg shadow-accent-500/25 hover:shadow-xl hover:-translate-y-0.5',
  solid: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:-translate-y-0.5',
  outline:
    'border border-border-strong hover:border-primary-500 text-text-primary hover:text-primary-600 hover:bg-primary-50',
  outlineLight:
    'border border-white/40 text-white hover:bg-white hover:text-text-primary',
  ghost: 'text-primary-600 hover:bg-primary-50',
  dark: 'bg-text-primary hover:bg-black text-white',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const buttonClass = (variant = 'primary', size = 'md', extra = '') =>
  `${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${extra}`;

const Button = ({
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) => {
  const cls = buttonClass(variant, size, className);

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export default Button;
