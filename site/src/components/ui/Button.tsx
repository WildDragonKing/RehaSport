import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary";

type ButtonBaseProps = {
  variant?: ButtonVariant;
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
  const { variant = "primary", className, children } = props;
  const classes = ["button", `button--${variant}`];
  if (className) {
    classes.push(className);
  }

  if ("to" in props && props.to) {
    const { to, variant: _variant, className: _className, children: _children, ...rest } = props;
    return (
      <Link to={to} className={classes.join(" ")} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, className: _className, children: _children, type = "button", ...rest } = props;
  return (
    <button type={type} className={classes.join(" ")} {...rest}>
      {children}
    </button>
  );
}

export default Button;
