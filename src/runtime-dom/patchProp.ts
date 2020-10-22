import { RendererOptions } from "../types";

const onRE = /^on[^a-z]/;
type Style = Record<string, string | string[]>;

type DOMRendererOptions = RendererOptions<Node, Element>;

// 是不是on开头的，比如onClick
const isOn = (key: string) => onRE.test(key);

// 给元素绑定样式
const patchStyle = (el: Element, style: Style) => {
  for (const key in style) {
    (el as HTMLElement).style[key] = style[key];
  }
};

// 给元素添加事件
const patchEvent = (el: Element, rawName: string, handle: EventListener) => {
  // 比如 rawName 等于 onClick
  // 那么 rawName.slice(2) 等于Click
  const eventName = rawName.slice(2).toLowerCase();
  el.addEventListener(eventName, handle);
};

// 根据props，做对应的操作
const hostPatchProp: DOMRendererOptions["patchProp"] = (el, key, value) => {
  switch (key) {
    case "style":
      patchStyle(el, value);
      break;
    default:
      if (isOn(key)) {
        patchEvent(el, key, value);
      } else {
        el.setAttribute(key, value);
      }
      break;
  }
};

export { hostPatchProp };
