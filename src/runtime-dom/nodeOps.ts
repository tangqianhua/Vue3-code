import { RendererOptions } from "../types";

const nodeOps: Omit<RendererOptions<Node, Element>, "patchProp"> = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },

  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },

  createElement: (tag): Element => document.createElement(tag),

  createText: (text) => document.createTextNode(text),

  setElementText: (el, text) => {
    el.textContent = text;
  },

  querySelector: (selector) => document.querySelector(selector),
};

export { nodeOps };
