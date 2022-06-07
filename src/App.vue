<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Konva from "konva";
import _ from "lodash";

const container = ref(null);

// 创建两个矩形、一个折线元素
let layer, rect1, rect2, line;

// 矩形移动事件
let cacheStartPoint = null;
let cacheEndPoint = null;
const onDragMove = () => {
  // 计算出所有可能的点
  let { startPoint, endPoint, fakeStartPoint, fakeEndPoint, points } =
    computedProbablyPoints();
  // 将真正的起终点保存到全局作用域，方便其他方法引用
  cacheStartPoint = startPoint;
  cacheEndPoint = endPoint;
  // 使用回溯算法找出其中一条路径
  const routes = useDFS(fakeStartPoint, fakeEndPoint, points);
  // 更新连线元素
  line.points(
    [startPoint, ...routes, endPoint].reduce((path, cur) => {
      path.push(cur[0], cur[1]);
      return path;
    }, [])
  );
};

// 使用回溯算法寻找路径
const useDFS = (startPoint, endPoint, points) => {
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

// 计算所有可能经过的点
const MIN_DISTANCE = 30;
const computedProbablyPoints = () => {
  let rect1X = rect1.x();
  let rect1Y = rect1.y();
  let rect1W = rect1.width();
  let rect1H = rect1.height();

  let rect2X = rect2.x();
  let rect2Y = rect2.y();
  let rect2W = rect2.width();
  let rect2H = rect2.height();

  // 起终点
  let startPoint = [rect1X + rect1W / 2, rect1Y];
  let endPoint = [rect2X + rect2W / 2, rect2Y];

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
  let fakeStartPoint = [startPoint[0], rect1Y - MIN_DISTANCE];
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
  let fakeEndPoint = [endPoint[0], rect2Y - MIN_DISTANCE];
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

  // console.log("数量：", points.length);

  points = removeDuplicatePoint(points);

  // console.log("去重后的数量：", points.length);

  drawTestDots(points);

  return {
    startPoint,
    endPoint,
    fakeStartPoint,
    fakeEndPoint,
    points,
  };
};

// 找出一个点周边的点
const getNextPoints = (point, points) => {
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
  let xNextPoints = getNextPoint(y, xSamePoints, 1);

  // 找出y方向最近的点
  let yNextPoints = getNextPoint(x, ySamePoints, 0);

  return [...yNextPoints, ...xNextPoints];
};

// 找出水平或垂直方向上最近的点
const getNextPoint = (value, list, index) => {
  let nextLeftTopPoint = null;
  let nextRIghtBottomPoint = null;
  for (let i = 0; i < list.length; i++) {
    let cur = list[i];
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
    checkIsSamePoint(nextLeftTopPoint, cacheStartPoint) ||
    checkIsSamePoint(nextLeftTopPoint, cacheEndPoint)
  ) {
    nextLeftTopPoint = null;
  }
  if (
    checkIsSamePoint(nextRIghtBottomPoint, cacheStartPoint) ||
    checkIsSamePoint(nextRIghtBottomPoint, cacheEndPoint)
  ) {
    nextRIghtBottomPoint = null;
  }
  return [nextLeftTopPoint, nextRIghtBottomPoint].filter((point) => {
    return !!point;
  });
};

// 检测是否为同一个点
const checkIsSamePoint = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
};

// 检查一个点是否存在于列表中
const checkPointExist = (point, list) => {
  return list.find((item) => {
    return item[0] === point[0] && item[1] === point[1];
  });
};

// 去重
const removeDuplicatePoint = (points) => {
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

// 绘制所有可能的顶点，测试用
let testDotElementList = [];
const drawTestDots = (points) => {
  testDotElementList.forEach((testDotElement) => {
    testDotElement.remove();
  });
  testDotElementList = points.map((point) => {
    const circle = new Konva.Circle({
      x: point[0],
      y: point[1],
      radius: 2,
      fill: "red",
      stroke: "black",
      strokeWidth: 4,
    });

    layer.add(circle);

    return circle;
  });
};

// 初始化图形
const init = () => {
  const { width, height } = container.value.getBoundingClientRect();

  // 创建舞台
  let stage = new Konva.Stage({
    container: container.value,
    width,
    height,
  });

  // 创建图层
  layer = new Konva.Layer();

  // 创建两个矩形
  rect1 = new Konva.Rect({
    x: 400,
    y: 200,
    width: 100,
    height: 100,
    fill: "#fbfbfb",
    stroke: "black",
    strokeWidth: 4,
    draggable: true,
  });

  rect2 = new Konva.Rect({
    x: 800,
    y: 600,
    width: 100,
    height: 100,
    fill: "#fbfbfb",
    stroke: "black",
    strokeWidth: 4,
    draggable: true,
  });

  // 监听拖拽事件
  rect1.on("dragmove", onDragMove);

  rect2.on("dragmove", onDragMove);

  // 矩形添加到图层
  layer.add(rect1);

  layer.add(rect2);

  line = new Konva.Line({
    points: [],
    stroke: "green",
    strokeWidth: 2,
    lineJoin: "round",
  });

  layer.add(line);

  // 图层添加到舞台
  stage.add(layer);

  // 绘制
  layer.draw();
};

// 计算两条直线的交点
const getTwoLineIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  let x, y;

  // 直线1方程：A1x+B1y+C1=0
  let B1 = 1;
  let A1, C1;
  A1 = (y1 - y2) / (x2 - x1);
  C1 = 0 - B1 * y1 - A1 * x1;
  // A1 * x + B1 * y + C1 = 0     // 1式
  // y = (0 - A1 * x - C1) / B1   // 2式

  // 直线2方程：A2x+B2y+C2=0
  let B2 = 1;
  let A2, C2;
  A2 = (y3 - y4) / (x4 - x3);
  C2 = 0 - B2 * y3 - A2 * x3;
  // A2 * x + B2 * y + C2 = 0     // 3式

  // 2式代入3式，计算出x
  // A2 * B1 * x - B2 * A1 * x = 0 - C2 * B1 + B2 * C1

  // 计算出x、y
};

onMounted(() => {
  init();
});
</script>

<style>
.container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
