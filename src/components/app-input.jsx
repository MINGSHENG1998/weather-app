import { memo, useMemo } from "react";
import PropTypes from "prop-types";

import { classNames } from "./../util/common";

const AppInput = (props) => {
  const className = useMemo(() => {
    return classNames({
      "app-input": true,
      ...(props.className && {
        [props.className]: true,
      }),
    });
  }, [props.className]);

  return (
    <input
      type={props.type}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      disabled={props.disabled}
      className={className}
    />
  );
};

AppInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

AppInput.defaultProps = {
  type: "text",
};

export default memo(AppInput);
