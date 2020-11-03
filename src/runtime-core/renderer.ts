import {
  RendererElement,
  RendererNode,
  PatchFn,
  VNode,
  MountChildrenFn,
  ComponentInternalInstance,
  Data,
  VNodeArrayChildren,
} from "../types";

import { nodeOps } from "../runtime-dom/nodeOps";
import { hostPatchProp } from "../runtime-dom/patchProp";
import { effect } from "../reactivity/effect";

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode,
  container: HostElement
) => void;

const render: RootRenderFunction = (vnode, container) => {
  patch(container._vnode || null, vnode, container);

  container._vnode = vnode;
};

const isSameVNodeType = (n1: VNode, n2: VNode): boolean => {
  return n1.tag === n2.tag && n1.key === n2.key;
};

const patch: PatchFn = (n1, n2, container, anchor = null) => {
  const { tag } = n2;

  if (typeof tag === "string") {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container, anchor);
    }
  } else {
    mountComponent(n2, container, anchor);
  }
};

const mountElement = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => {
  const { tag, props, children } = vnode;

  let el = (vnode.el = nodeOps.createElement(tag));

  if (Array.isArray(children)) {
    // 如果子节点是数组
    // 就要遍历数组，操作子节点
    mountChildren(children, el, null);
  } else if (typeof children === "string") {
    // 如果是String，那么直接插入到元素里面
    nodeOps.setElementText(el, children);
  }

  if (props) {
    for (const key in props) {
      hostPatchProp(el, key, null, props[key]);
    }
  }

  // 最后把元素插入到container里面
  nodeOps.insert(el, container, anchor);
};

const mountChildren: MountChildrenFn = (children, container, anchor?) => {
  for (let i = 0; i < children.length; i++) {
    const child = <VNode>children[i];
    patch(null, child, container, anchor);
  }
};

const mountComponent = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => {
  const instance = createComponentInstance(vnode);
  setupComponent(instance, container);
};

const patchElement = (
  n1: VNode,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null
) => {
  // 第二次渲染的时候，才会执行diff，el是在第一次渲染的时候赋值的
  const el = (n2.el = n1.el!);

  const oldProps = n1.props || {};
  const newProps = n2.props || {};

  patchProps(el, n2, oldProps, newProps);

  patchChildren(n1, n2, el);
};

const patchProps = (
  el: RendererElement,
  vnode: VNode,
  oldProps: Data,
  newProps: Data
) => {
  // 遍历新属性，以新属性为标准
  if (oldProps !== newProps) {
    for (const key in newProps) {
      const prev = oldProps[key];
      const next = newProps[key];
      if (prev !== next) {
        hostPatchProp(el, key, prev, next);
      }
    }
  }

  // 遍历老属性，如果老的属性不存在新的属性上，那么就要移除老的属性
  for (const key in oldProps) {
    if (!Object.prototype.hasOwnProperty.call(newProps, key)) {
      hostPatchProp(el, key, oldProps[key], null);
    }
  }
};

const patchChildren = (n1: VNode, n2: VNode, el: RendererElement) => {
  const c1 = n1 && n1.children;
  const c2 = n2.children;

  if (typeof c2 === "string") {
    if (Array.isArray(c1)) {
      const childNodes = el.childNodes;
      for (var i = 0; i < childNodes.length; i++) {
        el.removeChild(childNodes[i]);
      }
    }

    if (c1 !== c2) {
      setElementText(el, c2 as string);
    }
  } else if (typeof c1 === "string") {
    setElementText(el, "");
    c2 && mountChildren(c2, el, null);
  } else {
    patchKeyedChildren(c1! as VNode[], c2!, el);
  }
};

const setElementText = (container: RendererElement, text: string) => {
  container.textContent = text;
};

const patchKeyedChildren = (
  c1: VNode[],
  c2: VNodeArrayChildren,
  container: RendererElement
) => {
  let e1 = c1.length - 1; // 老的索引（最后一个）
  let e2 = c2.length - 1; // 新的索引（最后一个）

  let i = 0;

  /**
   * 从「头」开始遍历，如果发现老节点跟新节点的tag跟key一样，就patch，否则就退出遍历
   * i 用来记录位置
   */
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i] as VNode;

    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }

    i++;
  }

  /**
   * 从「尾」开始遍历，如果发现老节点跟新节点的tag跟key一样，就patch，否则就退出遍历
   * e1-- 跟 e2-- 是为了防止patch过的节点不再处理
   */
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2] as VNode;

    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container);
    } else {
      break;
    }

    e1--;
    e2--;
  }

  /**
   * 执行到这一步的时候，说明已经掐头去尾了，所以要对中间的部分做处理
   * 如果 i > e1, 说明新节点比老的多，所以要挂载新节点
   */
  if (i > e1) {
    if (i <= e2) {
      const anchor = e2 + 1 < c2.length ? (c2[e2 + 1] as VNode).el : null;
      while (i <= e2) {
        patch(null, c2[i] as VNode, container, anchor);
        i++;
      }
    }
  } else if (i > e2) {
    /**
     * 当 i > e2 && 1<=e1的时候，说明老的节点比新的节点多，就要移除老节点
     */
    while (i <= e1) {
      nodeOps.remove(c1[i].el as Node);
      i++;
    }
  } else {
    /**
     * 当执行到这里的时候，就是是未知的节点对比
     * 1: 可能是移动
     * 2: 可能是新增
     * 3: 可能是删除
     */

    const s1 = i;
    const s2 = i;
    /**
     * keyToNewIndexMap 映射表，用来存储 key -> index
     * {"a" => 0},
     * {"b" => 1},
     * {"c" => 2},
     * {"d" => 3},
     */

    const keyToNewIndexMap: Map<string | number, number> = new Map();

    // 遍历新的虚拟节点，将key、index，存储在映射表中
    for (let idx = i; idx <= e2; idx++) {
      const newVNode = c2[idx] as VNode;
      keyToNewIndexMap.set(newVNode.key!, idx);
    }

    // 新节点中，没有path过的数量
    const toBePatched = e2 - s2 + 1;

    // 用来记录新的节点是否path过。默认是0，代表的是没打过
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    // 遍历没有处理过的老节点
    for (let index = s1; index <= e1; index++) {
      const oldVNode = c1[index] as VNode;
      const newIndex = keyToNewIndexMap.get(oldVNode.key);

      // 如果找不到，当前的key对应的虚拟节点，只存在老的节点中，不存在新的节点里面，就要移除老节点
      if (newIndex === undefined) {
        nodeOps.remove(oldVNode.el as Node);
      } else {
        // 如果找到老，就patch，并且标示对应的newIndexToOldIndexMap
        // 这里 index + 1 ，是因为getSequence方法里面有个bug，不会对0做处理
        newIndexToOldIndexMap[newIndex - s2] = index + 1;
        patch(oldVNode, c2[newIndex] as VNode, container);
      }
    }

    // 获取最长递增序列
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
    let j = increasingNewIndexSequence.length - 1;

    console.log(newIndexToOldIndexMap);
    console.log(increasingNewIndexSequence);

    // 从后向前遍历
    for (let ii = toBePatched - 1; ii >= 0; ii--) {
      const nextIndex = s2 + ii;
      const nextChild = c2[nextIndex] as VNode;
      const anchor =
        nextIndex + 1 < c2.length ? (c2[nextIndex + 1] as VNode).el : null;

      // 如果等于0，那么就要挂载vnode
      if (newIndexToOldIndexMap[ii] === 0) {
        patch(null, nextChild, container, anchor);
      } else {
        if (ii === increasingNewIndexSequence[j]) {
          j--;
        } else {
          nodeOps.insert(nextChild.el as Element, container, anchor);
        }
      }
    }
  }
};

const createComponentInstance = (vnode: VNode) => {
  const instance: ComponentInternalInstance = {
    vnode,
    emit: null,
    slots: null,
    attrs: {},
    props: {},
    subTree: null,
    render: null,
  };

  return instance;
};

const setupComponent = (
  instance: ComponentInternalInstance,
  container: RendererElement
) => {
  const { props, children, tag: Component } = instance.vnode;

  if (typeof Component === "object") {
    const { setup } = Component as any;

    if (setup) {
      instance.render = setup(props, instance) || instance.render;

      // 添加effect
      effect(() => {
        instance.subTree = instance.render && instance.render();

        patch(null, instance.subTree!, container);
      });
    }
  }
};

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

export { render };
