import { VNode } from "./vnode";

export type Data = Record<string, unknown>;

export type Slot = (...args: any[]) => VNode[];

export type InternalSlots = {
  [name: string]: Slot | undefined;
};

export type Slots = Readonly<InternalSlots>;

export interface ComponentInternalInstance {
  vnode: VNode;
  slots: Slots | null;
  attrs: Data | null;
  props: Data | null;
  subTree: VNode | null;
  emit: any | null;
  render: Function | null;
  setup?: Function;
}
