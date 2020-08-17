import style from "./svgImages.module.css";

export default {
  checkmark: (
    <svg
      className={style.image}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle className={style.circle} cx="26" cy="26" r="25" fill="none" />
      <path
        className={style.symbol}
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  ),
  cross: (
    <svg
      className={style.image}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle className={style.circle} cx="26" cy="26" r="25" fill="none" />
      <line className={style.symbol} x1="35" y1="16" x2="16" y2="35"></line>
      <line className={style.symbol} x1="16" y1="16" x2="35" y2="35"></line>
    </svg>
  ),
};
