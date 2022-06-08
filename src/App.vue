<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import _ from "lodash";
import AStar from "./AStar";
import { init, drawTestDots, updateLine } from "./draw";
import { setRect, computedProbablyPoints } from "./utils";
import { useDFS } from "./dfs";

const container = ref(null);
const aStar = new AStar();

// 矩形移动事件
const onDragMove = () => {
  // 计算出所有可能的点
  let { startPoint, endPoint, fakeStartPoint, fakeEndPoint, points } =
    computedProbablyPoints();
  // 绘制辅助点
  drawTestDots(points);
  const routes = aStar.start(fakeStartPoint, fakeEndPoint, points);
  // 使用回溯算法找出其中一条路径
  // const routes = useDFS(fakeStartPoint, fakeEndPoint, points);
  // 更新连线元素
  updateLine(
    (routes.length > 0 ? [startPoint, ...routes, endPoint] : []).reduce(
      (path, cur) => {
        path.push(cur[0], cur[1]);
        return path;
      },
      []
    )
  );
};

onMounted(() => {
  let { rect1, rect2 } = init(container, onDragMove);
  setRect(rect1, rect2);
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
