import { VNode } from "./vnode";
export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export type PatchFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null
) => void;

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void;
  remove(el: HostNode): void;
  createElement(type: string | any): HostElement;
  createText(text: string): HostNode;
  setElementText(node: HostElement, text: string): void;
  querySelector(selector: string): HostElement | null;
  patchProp(el: HostElement, key: string, prevValue: any, nextValue: any): void;
}
