import { memo, useMemo } from "react";
import PropTypes from "prop-types";

import { classNames } from "./../util/common";

const AppButton = (props) => {
  const className = useMemo(() => {
    return classNames({
      "app-button": true,
	  "app-button-text": props.textBtn || false,
      ...(props.className && {
        [props.className]: true,
      }),
    });
  }, [props.className, props.large, props.outline]);

  return (
    <button
      className={className}
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children || <p className="app-button__label">{props.label}</p>}
    </button>
  );
};

AppButton.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  textBtn: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  children: PropTypes.element,
  type: PropTypes.oneOf(["button", "submit", "reset"]).isRequired,
};

export default memo(AppButton);
