import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ButtonSize = "sm" | "default" | "lg";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  to: string;
  "aria-label"?: string;
  target?: string;
  rel?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

function Button(props: ButtonProps): JSX.Element {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "default";
  const isIcon = props.icon ?? false;

  // Variant classes using CSS classes from index.css
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    ghost: "btn-ghost",
  };

  // Size classes
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "btn-sm",
    default: "",
    lg: "btn-lg",
  };

  const classes = [
    "btn",
    variantClasses[variant],
    sizeClasses[size],
    isIcon ? "btn-icon" : "",
    props.className,
  ].filter(Boolean).join(" ");

  if ("to" in props && props.to) {
    const { to, variant: _v, size: _s, icon: _i, className: _c, children, ...rest } = props;
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, icon: _i, className: _c, children, type = "button", ...rest } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export default Button;
