import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
      <Link to="/" className="hover:text-primary-600 transition-colors font-medium">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <span className="text-border-strong">/</span>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-primary-600 transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary font-semibold truncate max-w-[14rem]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
