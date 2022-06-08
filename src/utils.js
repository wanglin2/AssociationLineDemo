let rect1,
  rect2,
  startPoint = null,
  endPoint = null;

let rect1X, rect1Y, rect1W, rect1H, rect2X, rect2Y, rect2W, rect2H;

const MIN_DISTANCE = 30;

// 保存矩形元素
export const setRect = (r1, r2) => {
  rect1 = r1;
  rect2 = r2;
};

// 计算所有可能经过的点
export const computedProbablyPoints = () => {
  rect1X = rect1.x();
  rect1Y = rect1.y();
  rect1W = rect1.width();
  rect1H = rect1.height();

  rect2X = rect2.x();
  rect2Y = rect2.y();
  rect2W = rect2.width();
  rect2H = rect2.height();

  // 起终点
  // startPoint = [rect1X + rect1W / 2, rect1Y];// 上
  startPoint = [rect1X, rect1Y + rect1H / 2]; // 左

  // endPoint = [rect2X + rect2W / 2, rect2Y];// 上
  endPoint = [rect2X, rect2Y + rect2H / 2]; // 左
  // endPoint = [rect2X + rect2W, rect2Y + rect2H / 2]; // 右
  // endPoint = [rect2X + rect2W / 2, rect2Y + rect2H];// 下

  // 保存所有可能经过的点
  let points = [startPoint, endPoint];

  // 起点元素包围框上的四个顶点
  let startBoundingBox = [
    [rect1X - MIN_DISTANCE, rect1Y - MIN_DISTANCE], // 左上
    [rect1X + rect1W + MIN_DISTANCE, rect1Y - MIN_DISTANCE], // 右上
    [rect1X - MIN_DISTANCE, rect1Y + rect1H + MIN_DISTANCE], // 左下
    [rect1X + rect1W + MIN_DISTANCE, rect1Y + rect1H + MIN_DISTANCE], // 右下
  ];
  points.push(...startBoundingBox);

  // 经过起点且垂直于起点元素包围框的线与包围框线的交点
  let fakeStartPoint = findStartNextOrEndPrePoint(rect1, startPoint);
  points.push(fakeStartPoint);

  // 终点元素保包围框上的四个顶点
  let endBoundingBox = [
    [rect2X - MIN_DISTANCE, rect2Y - MIN_DISTANCE], // 左上
    [rect2X + rect2W + MIN_DISTANCE, rect2Y - MIN_DISTANCE], // 右上
    [rect2X - MIN_DISTANCE, rect2Y + rect2H + MIN_DISTANCE], // 左下
    [rect2X + rect2W + MIN_DISTANCE, rect2Y + rect2H + MIN_DISTANCE], // 右下
  ];
  points.push(...endBoundingBox);

  // 经过终点且垂直于终点元素包围框的线与包围框线的交点
  let fakeEndPoint = findStartNextOrEndPrePoint(rect2, endPoint);
  points.push(fakeEndPoint);

  // 两个包围框组成的更大的包围框的四个顶点
  let boundingBoxXList = [];
  let boundingBoxYList = [];
  [...startBoundingBox, ...endBoundingBox].forEach((item) => {
    boundingBoxXList.push(item[0]);
    boundingBoxYList.push(item[1]);
  });
  let minBoundingBoxX = Math.min(...boundingBoxXList);
  let minBoundingBoxY = Math.min(...boundingBoxYList);
  let maxBoundingBoxX = Math.max(...boundingBoxXList);
  let maxBoundingBoxY = Math.max(...boundingBoxYList);
  points.push(
    [minBoundingBoxX, minBoundingBoxY],
    [maxBoundingBoxX, minBoundingBoxY],
    [minBoundingBoxX, maxBoundingBoxY],
    [maxBoundingBoxX, maxBoundingBoxY]
  );

  // 起点元素包围框两条水平边的延长线与大包围框的交点
  points.push(
    [minBoundingBoxX, startBoundingBox[0][1]],
    [maxBoundingBoxX, startBoundingBox[0][1]],
    [minBoundingBoxX, startBoundingBox[2][1]],
    [maxBoundingBoxX, startBoundingBox[2][1]]
  );

  // 起点元素包围框两条垂直边的延长线与大包围框的交点
  points.push(
    [startBoundingBox[0][0], minBoundingBoxY],
    [startBoundingBox[0][0], maxBoundingBoxY],
    [startBoundingBox[1][0], minBoundingBoxY],
    [startBoundingBox[1][0], maxBoundingBoxY]
  );

  // 终点元素包围框两条水平边的延长线与大包围框的交点
  points.push(
    [minBoundingBoxX, endBoundingBox[0][1]],
    [maxBoundingBoxX, endBoundingBox[0][1]],
    [minBoundingBoxX, endBoundingBox[2][1]],
    [maxBoundingBoxX, endBoundingBox[2][1]]
  );

  // 终点元素包围框两条垂直边的延长线与大包围框的交点
  points.push(
    [endBoundingBox[0][0], minBoundingBoxY],
    [endBoundingBox[0][0], maxBoundingBoxY],
    [endBoundingBox[1][0], minBoundingBoxY],
    [endBoundingBox[1][0], maxBoundingBoxY]
  );

  // 起点包围框的水平边的延长线与终点包围框的垂直边的延长线的交点
  points.push(
    [startBoundingBox[0][0], endBoundingBox[0][1]],
    [startBoundingBox[1][0], endBoundingBox[0][1]],
    [startBoundingBox[0][0], endBoundingBox[2][1]],
    [startBoundingBox[1][0], endBoundingBox[2][1]]
  );

  // 起点包围框的垂直边的延长线与终点包围框的水平边的延长线的交点
  points.push(
    [endBoundingBox[0][0], startBoundingBox[0][1]],
    [endBoundingBox[0][0], startBoundingBox[2][1]],
    [endBoundingBox[1][0], startBoundingBox[0][1]],
    [endBoundingBox[1][0], startBoundingBox[2][1]]
  );

  // 经过起点的垂直线与包围框所有水平边延长线的交点
  points.push(
    [startPoint[0], startBoundingBox[0][1]],
    [startPoint[0], startBoundingBox[2][1]],
    [startPoint[0], endBoundingBox[0][1]],
    [startPoint[0], endBoundingBox[2][1]]
  );

  // 经过终点的垂直线与包围框所有水平边延长线的交点
  points.push(
    [endPoint[0], startBoundingBox[0][1]],
    [endPoint[0], startBoundingBox[2][1]],
    [endPoint[0], endBoundingBox[0][1]],
    [endPoint[0], endBoundingBox[2][1]]
  );

  // 去重
  points = removeDuplicatePoint(points);

  return {
    startPoint,
    endPoint,
    fakeStartPoint,
    fakeEndPoint,
    points,
  };
};

// 找出起点的下一个点或终点的前一个点
export const findStartNextOrEndPrePoint = (rect, point) => {
  // 起点或终点在左边
  if (point[0] === rect.x()) {
    return [rect.x() - MIN_DISTANCE, rect.y() + rect.height() / 2];
  } else if (point[1] === rect.y()) {
    // 起点或终点在上边
    return [rect.x() + rect.width() / 2, rect.y() - MIN_DISTANCE];
  } else if (point[0] === rect.x() + rect.width()) {
    // 起点或终点在右边
    return [
      rect.x() + rect.width() + MIN_DISTANCE,
      rect.y() + rect.height() / 2,
    ];
  } else if (point[1] === rect.y() + rect.height()) {
    // 起点或终点在下边
    return [
      rect.x() + rect.width() / 2,
      rect.y() + rect.height() + MIN_DISTANCE,
    ];
  }
};

// 找出一个点周边的点
export const getNextPoints = (point, points) => {
  let [x, y] = point;
  let xSamePoints = [];
  let ySamePoints = [];

  // 找出x或y坐标相同的点
  points.forEach((item) => {
    if (checkIsSamePoint(point, item)) {
      return;
    }
    if (item[0] === x) {
      xSamePoints.push(item);
    }
    if (item[1] === y) {
      ySamePoints.push(item);
    }
  });

  // 找出x方向最近的点
  let xNextPoints = getNextPoint(x, y, xSamePoints, "y");

  // 找出y方向最近的点
  let yNextPoints = getNextPoint(x, y, ySamePoints, "x");

  return [...yNextPoints, ...xNextPoints];
};

// 找出水平或垂直方向上最近的点
export const getNextPoint = (x, y, list, dir) => {
  let index = dir === "x" ? 0 : 1;
  let value = dir === "x" ? x : y;
  let nextLeftTopPoint = null;
  let nextRIghtBottomPoint = null;
  for (let i = 0; i < list.length; i++) {
    let cur = list[i];
    // 检查垂直线是否穿过元素或离元素太近
    if (checkLineThroughOrClose([x, y], cur)) {
      continue;
    }
    // 左侧或上方最近的点
    if (cur[index] < value) {
      if (nextLeftTopPoint) {
        if (cur[index] > nextLeftTopPoint[index]) {
          nextLeftTopPoint = cur;
        }
      } else {
        nextLeftTopPoint = cur;
      }
    }
    // 右侧或下方最近的点
    if (cur[index] > value) {
      if (nextRIghtBottomPoint) {
        if (cur[index] < nextRIghtBottomPoint[index]) {
          nextRIghtBottomPoint = cur;
        }
      } else {
        nextRIghtBottomPoint = cur;
      }
    }
  }
  // 如果下一个点是起点或终点，那么直接忽略掉
  if (
    checkIsSamePoint(nextLeftTopPoint, startPoint) ||
    checkIsSamePoint(nextLeftTopPoint, endPoint)
  ) {
    nextLeftTopPoint = null;
  }
  if (
    checkIsSamePoint(nextRIghtBottomPoint, startPoint) ||
    checkIsSamePoint(nextRIghtBottomPoint, endPoint)
  ) {
    nextRIghtBottomPoint = null;
  }
  return [nextLeftTopPoint, nextRIghtBottomPoint].filter((point) => {
    return !!point;
  });
};

// 检查直线是否穿过元素或离元素太近
export const checkLineThroughOrClose = (a, b) => {
  let rects = [rect1, rect2];
  let minX = Math.min(a[0], b[0]);
  let maxX = Math.max(a[0], b[0]);
  let minY = Math.min(a[1], b[1]);
  let maxY = Math.max(a[1], b[1]);

  // 水平线
  if (a[1] === b[1]) {
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (
        minY >= rect.y() &&
        minY <= rect.y() + rect.height() &&
        minX <= rect.x() + rect.width() &&
        maxX >= rect.x()
      ) {
        return true;
      }
    }
  } else if (a[0] === b[0]) {
    // 垂直线
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (
        minX >= rect.x() &&
        minX <= rect.x() + rect.width() &&
        minY <= rect.y() + rect.height() &&
        maxY >= rect.y()
      ) {
        return true;
      }
    }
  }

  return false;
};

// 检测是否为同一个点
export const checkIsSamePoint = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
};

// 去重
export const removeDuplicatePoint = (points) => {
  let res = [];
  let cache = {};
  points.forEach(([x, y]) => {
    if (cache[x + "-" + y]) {
      return;
    } else {
      cache[x + "-" + y] = true;
      res.push([x, y]);
    }
  });
  return res;
};