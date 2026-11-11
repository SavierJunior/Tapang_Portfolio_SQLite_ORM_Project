// Shared button / link-button. Pass `href` to render an <a>, otherwise a <button>.
export default function Button({
  variant = "primary",
  href,
  loading = false,
  icon,
  className = "",
  children,
  ...rest
}) {
  const classes = `btn btn--${variant} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {icon && !loading && (
        <span className="btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {loading && <span className="btn__spinner" aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {content}
      </a>
    );
  }

  const { type = "button", disabled, ...buttonProps } = rest;
  return (
    <button className={classes} type={type} disabled={disabled || loading} {...buttonProps}>
      {content}
    </button>
  );
}
