<template>
  <div class="container" ref="container"></div>
  <div class="toolbar">
    <div class="item">
      <el-switch
        v-model="userAStar"
        active-text="使用A*算法"
        inactive-text="使用回溯算法"
        @change="reRender"
      />
    </div>
    <div class="item">
      <span class="name">起点位置：</span>
      <el-radio-group v-model="startPos" size="small" @change="reRender">
        <el-radio-button label="left">左</el-radio-button>
        <el-radio-button label="top">上</el-radio-button>
        <el-radio-button label="right">右</el-radio-button>
        <el-radio-button label="bottom">下</el-radio-button>
      </el-radio-group>
    </div>
    <div class="item">
      <span class="name">终点位置：</span>
      <el-radio-group v-model="endPos" size="small" @change="reRender">
        <el-radio-button label="left">左</el-radio-button>
        <el-radio-button label="top">上</el-radio-button>
        <el-radio-button label="right">右</el-radio-button>
        <el-radio-button label="bottom">下</el-radio-button>
      </el-radio-group>
    </div>
  </div>
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
const startPos = ref("top");
const endPos = ref("top");
const userAStar = ref(true);

// 重新渲染
const reRender = () => {
  drawTestDots([]);
  updateLine([]);
  onDragMove();
};

// 矩形移动事件
const onDragMove = () => {
  // 计算出所有可能的点
  let { startPoint, endPoint, fakeStartPoint, fakeEndPoint, points } =
    computedProbablyPoints(startPos.value, endPos.value);
  // 绘制辅助点
  drawTestDots(points);
  let routes = [];
  if (userAStar.value) {
    // 使用A*算法
    routes = aStar.start(fakeStartPoint, fakeEndPoint, points);
  } else {
    // 使用回溯算法找出其中一条路径
    routes = useDFS(fakeStartPoint, fakeEndPoint, points);
  }
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
  onDragMove();
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

.toolbar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 50px;
  display: flex;
}

.toolbar .item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.toolbar .item .name {
  font-size: 14px;
  color: #666;
}
</style>
