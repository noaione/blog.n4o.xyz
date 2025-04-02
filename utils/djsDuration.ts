import "dayjs/locale/en";
import "dayjs/locale/ja";
import "dayjs/locale/id";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

function installPlugin() {
  if (!dayjs().fromNow) {
    dayjs.extend(relativeTime);
  }
  if (!dayjs.duration) {
    dayjs.extend(duration);
  }
}

installPlugin();

export function getDuration(input: number): duration.Duration {
  return dayjs.duration(input, "milliseconds");
}
