import { RendererElement, RendererNode } from "./renderer";

export interface VNode {
  tag: String | Object | Function | null;
  props?: { [key: string]: any };
  children?: VNodeNormalizedChildren;
  key?: any;
  el?: { [key: string]: any } | null;
}

export type VNodeArrayChildren = Array<
  VNode | string | number | boolean | null | undefined
>;

export type VNodeNormalizedChildren = string | VNodeArrayChildren;

export type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null
) => void;
