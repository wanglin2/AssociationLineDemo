import Konva from "konva";

// 初始化图形
let layer = null,
  line;
export const init = (container, onDragMove) => {
  const { width, height } = container.value.getBoundingClientRect();

  // 创建舞台
  let stage = new Konva.Stage({
    container: container.value,
    width,
    height,
  });

  // 创建图层
  layer = new Konva.Layer();

  line = new Konva.Line({
    points: [],
    stroke: "#e6a23c",
    strokeWidth: 2,
    lineJoin: "round",
  });

  layer.add(line);

  // 创建两个矩形
  let rect1 = new Konva.Rect({
    x: 400,
    y: 200,
    width: 100,
    height: 100,
    fill: "#fbfbfb",
    stroke: "#f56c6c",
    strokeWidth: 4,
    draggable: true,
  });

  let rect2 = new Konva.Rect({
    x: 800,
    y: 600,
    width: 100,
    height: 100,
    fill: "#fbfbfb",
    stroke: "#409eff",
    strokeWidth: 4,
    draggable: true,
  });

  // 监听拖拽事件
  rect1.on("dragmove", onDragMove);

  rect2.on("dragmove", onDragMove);

  // 矩形添加到图层
  layer.add(rect1);

  layer.add(rect2);

  // 图层添加到舞台
  stage.add(layer);

  // 绘制
  layer.draw();

  return {
    rect1,
    rect2,
    line,
  };
};

// 绘制所有可能的顶点，测试用
let testDotElementList = [];
export const drawTestDots = (points) => {
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

// 更新连线
export const updateLine = (points) => {
  line.points(points);
};
