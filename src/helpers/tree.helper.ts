import { BaseEntity } from 'src/common/entities'

export function buildTree<T extends BaseEntity & { parentId: string }>(
  data: T[]
): T[] {
  const map = {} // 用于存储节点的字典
  const tree = [] // 最终的树形结构

  // 创建一个以 id 为键的字典
  data.forEach((item) => {
    map[item.id] = { ...item, children: [] } // 初始化每个节点的 children 为一个空数组
  })

  // 遍历数据并构建树
  data.forEach((item) => {
    if (item.parentId) {
      // 如果有 parentId，则将该节点添加到父节点的 children 中
      if (map[item.parentId]) {
        map[item.parentId].children.push(map[item.id])
      }
    } else {
      // 如果没有 parentId，将其视为一级节点
      tree.push(map[item.id])
    }
  })

  return tree
}

export function buildVueRouter<T extends BaseEntity>(treeData: T[]) {
  function transformNode(node) {
    const isRoot = !node.parentId // 判断是否为一级菜单

    const routeConfig = {
      ...node,
      path: node.router,
      name: node.name,
      component: node.component,
      meta: {
        id: node.id,
        icon: node.icon,
        type: node.type,
        title: node.name,
        sort: node.sort
      },
      children: node.children
        ? node.children.map((child) => transformNode(child))
        : [],
      redirect: null
    }

    // 如果是一级菜单且有子菜单，需要添加 redirect 字段
    if (isRoot && node.children && node.children.length > 0) {
      routeConfig.redirect = node.redirect || node.children[0].path
    }

    return routeConfig
  }

  return treeData.map((node) => transformNode(node))
}
