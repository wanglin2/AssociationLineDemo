import { checkIsSamePoint, getNextPoints } from "./utils";

// 使用回溯算法寻找路径
export const useDFS = (startPoint, endPoint, points) => {
  let res = [];
  let used = {};
  let track = (path, selects) => {
    for (let i = 0; i < selects.length; i++) {
      let cur = selects[i];
      // 到达终点了
      if (checkIsSamePoint(cur, endPoint)) {
        res = [...path, cur];
        break;
      }
      // 该点已经被选择过了
      let key = cur[0] + "-" + cur[1];
      if (used[key]) {
        continue;
      }
      used[key] = true;
      track([...path, cur], getNextPoints(cur, points));
      used[key] = false;
    }
  };
  track([], [startPoint]);
  return res;
};
