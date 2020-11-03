import { render } from "./runtime-core/renderer";
import { reactive } from "./reactivity/reactivity";
import { effect } from "./reactivity/effect";
import { VNode } from "./types";
import { ref } from "./reactivity/ref";
import { computed } from "./reactivity/computed";

let vnode: VNode = {
  tag: "ul",
  props: {
    style: {
      color: "blue",
    },
    onClick: () => {
      console.log(2);
    },
    class: "test1",
  },
  children: [
    { tag: "li", props: {}, children: "a", key: "a" },
    { tag: "li", props: {}, children: "b", key: "b" },
    { tag: "li", props: {}, children: "c", key: "c" },
    { tag: "li", props: {}, children: "d", key: "d" },
    { tag: "li", props: {}, children: "e", key: "e" },
    { tag: "li", props: {}, children: "f", key: "f" },
  ],
};

render(vnode, document.querySelector("#app")!);

setTimeout(() => {
  const newVnode: VNode = {
    tag: "ul",
    props: {
      style: {
        color: "blue",
      },
      onClick: () => {
        console.log(2);
      },
      class: "test1",
    },
    children: [
      { tag: "li", props: {}, children: "a", key: "a" },
      { tag: "li", props: {}, children: "d", key: "d" },
      { tag: "li", props: {}, children: "b", key: "b" },
      { tag: "li", props: {}, children: "e", key: "e" },
      { tag: "li", props: {}, children: "c", key: "c" },
    ],
  };

  render(newVnode, document.querySelector("#app")!);
}, 1000);
