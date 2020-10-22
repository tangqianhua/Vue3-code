import {
  RendererElement,
  RendererNode,
  PatchFn,
  VNode,
  MountChildrenFn,
  ComponentInternalInstance,
} from "../types";

import { nodeOps } from "../runtime-dom/nodeOps";
import { hostPatchProp } from "../runtime-dom/patchProp";
import { effect } from "../reactivity/effect";

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement
) => void;

const render: RootRenderFunction = (vnode, container) => {
  if (vnode) {
    patch(null, vnode, container);
  }
};

const patch: PatchFn = (n1, n2, container, anchor = null) => {
  if (n1 === null) {
    const { tag } = n2;

    if (typeof tag === "string") {
      mountElement(n2, container, anchor);
    } else {
      mountComponent(n2, container, anchor);
    }
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
      hostPatchProp(el, key, props[key]);
    }
  }

  // 最后把元素插入到container里面
  nodeOps.insert(el, container, anchor);
};

const mountChildren: MountChildrenFn = (children, container, anchor) => {
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

export { render };
