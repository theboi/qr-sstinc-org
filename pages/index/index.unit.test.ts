import { getTruncatedDate, getKeyString } from "./index";

test("getTruncatedDate", () => {
  expect(getTruncatedDate(139)).toBe(39);
});

test("getKeyString", () => {
  expect(getKeyString("noice", new Date("December 17, 1995 03:24:00"))).toBe(
    "noice171295"
  );
});