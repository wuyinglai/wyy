/**
 * 计算教程走廊的视口范围
 * @param currentIndex 当前玩家所在的节点索引
 * @param totalNodes 总节点数
 * @param visibleColumns 可见列数
 * @returns 视口范围 { startIndex, endIndex }
 */
export function getTutorialCorridorViewportRange(
  currentIndex: number,
  totalNodes: number,
  visibleColumns: number
): { startIndex: number; endIndex: number } {
  // 如果总节点数小于等于可见列数，显示全部
  if (totalNodes <= visibleColumns) {
    return {
      startIndex: 0,
      endIndex: totalNodes,
    };
  }

  // 计算视口起始位置，尽量让当前节点在中间
  const half = Math.floor(visibleColumns / 2);
  let startIndex = currentIndex - half;

  // 确保不超出左边界
  startIndex = Math.max(0, startIndex);

  // 确保不超出右边界
  startIndex = Math.min(startIndex, totalNodes - visibleColumns);

  // 计算结束位置（不包含）
  const endIndex = startIndex + visibleColumns;

  return {
    startIndex,
    endIndex,
  };
}
