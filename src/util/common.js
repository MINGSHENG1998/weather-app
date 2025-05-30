export const encodeQueryParams = (params) => {
  if (!params) return "";
  if (typeof params !== "object") return params;

  const query = [];
  for (let q in params) {
    if (params[q] !== null && params[q] !== undefined)
      query.push(encodeURIComponent(q) + "=" + encodeURIComponent(params[q]));
  }

  return "?" + query.join("&");
};

export const convertWeatherApiResponse = (data) => {
  return JSON.parse(data.replace(/^test\((.*)\)$/, "$1"));
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  const parsedDate = new Date(date);

  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = parsedDate.toLocaleString("en-MY", options);
  const [datePart, timePart] = formattedDate.split(", ");
  const [day, month, year] = datePart.split("/");
  const formattedFinalDate = `${day}/${month}/${
    year.split(" ")[0]
  }, ${timePart}`;

  return formattedFinalDate;
};

export const classNames = (conditions) => {
  const classes = [];

  Object.keys(conditions).forEach((key) => {
    const condition = conditions[key];
    if (condition) classes.push(key);
  });

  return classes.join(" ");
};
