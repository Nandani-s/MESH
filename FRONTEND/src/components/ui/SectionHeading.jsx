
const ALIGN = {
  center: 'text-center mx-auto',
  left: 'text-left',
};

const SectionHeading = ({ eyebrow, title, subtitle, action, align = 'center' }) => (
  <div className={`mb-12 lg:mb-14 max-w-3xl ${ALIGN[align] || ALIGN.center}`}>
    <div
      className={`flex flex-wrap items-center gap-4 ${align === 'center' ? 'justify-center' : 'justify-between'}`}
    >
      <div>
        {eyebrow && (
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary-500 mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-text-primary tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-text-secondary text-lg mt-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  </div>
);

export default SectionHeading;
