const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#fff7f4"/>
    <path d="M250 155h140l54 53v120H196V208z" fill="#fce7e3" stroke="#e8a6a0" stroke-width="12" stroke-linejoin="round"/>
    <path d="M250 155v62h62v-62m78 0v62h54" fill="none" stroke="#e8a6a0" stroke-width="12" stroke-linejoin="round"/>
    <path d="M280 275h80" stroke="#d98983" stroke-width="10" stroke-linecap="round"/>
  </svg>
`)}`;

const ProductImage = ({ src, alt, className = '', ...props }) => (
  <img
    src={src || FALLBACK_IMAGE}
    alt={alt || ''}
    className={className}
    onError={(event) => {
      if (event.currentTarget.dataset.fallbackApplied !== 'true') {
        event.currentTarget.dataset.fallbackApplied = 'true';
        event.currentTarget.src = FALLBACK_IMAGE;
      }
    }}
    {...props}
  />
);

export default ProductImage;
