import { RendererOptions } from "../types";

const onRE = /^on[^a-z]/;
type Style = Record<string, string>;

type DOMRendererOptions = RendererOptions<Node, Element>;

// 是不是on开头的，比如onClick
const isOn = (key: string) => onRE.test(key);

// 给元素绑定样式
const patchStyle = (el: Element, prev: Style, next: Style) => {
  const style = (el as HTMLElement).style;

  //  如果没有新属性，那就要移除来的style
  if (!next) {
    el.removeAttribute("style");
  } else if (typeof next === "string") {
    // 比如 next = "color: red; fontSize: 12px"
    if (prev !== next) {
      style.cssText = next;
    }
  } else {
    // 新属性为object的时候
    for (const key in next) {
      style.setProperty(key, next[key]);
    }

    // 当老的属性不存在新的属性里面，就要移除老属性
    if (prev) {
      for (const key in prev) {
        if (next[key] == null) {
          style.setProperty(key, "");
        }
      }
    }
  }
};

// 绑定class
const patchClass = (el: Element, value: string | null) => {
  if (value == null) {
    value = "";
  }

  el.className = value;
};

// 给元素添加事件
const patchEvent = (
  el: Element,
  rawName: string,
  prevValue: EventListener,
  nextValue: EventListener
) => {
  // 比如 rawName 等于 onClick
  // 那么 rawName.slice(2) 等于Click
  const eventName = rawName.slice(2).toLowerCase();
  prevValue && el.removeEventListener(eventName, prevValue);
  nextValue && el.addEventListener(eventName, nextValue);
};

// 根据props，做对应的操作
const hostPatchProp: DOMRendererOptions["patchProp"] = (
  el,
  key,
  oldValue,
  newValue
) => {
  switch (key) {
    case "style":
      patchStyle(el, oldValue, newValue);
      break;
    case "class":
      patchClass(el, newValue);
    default:
      if (isOn(key)) {
        patchEvent(el, key, oldValue, newValue);
      } else {
        // id  data-xxx
        el.setAttribute(key, newValue);
      }
      break;
  }
};

export { hostPatchProp };
