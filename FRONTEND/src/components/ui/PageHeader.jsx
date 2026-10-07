import Container from './Container';
import Breadcrumb from './Breadcrumb';

const PageHeader = ({ eyebrow, title, subtitle, breadcrumb = [], action, children }) => (
  <section className="bg-background-muted border-b border-border-light">
    <Container className="py-5 lg:py-7">
      {breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          {eyebrow && (
            <span className="block text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-2">
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl lg:text-3xl font-extrabold text-text-primary tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Container>
  </section>
);

export default PageHeader;
