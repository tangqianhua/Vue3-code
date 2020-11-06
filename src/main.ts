import { render } from "./runtime-core/renderer";
import { VNode } from "./types";

// children: [
//   { tag: "li", props: {}, children: "a", key: "a" },
//   { tag: "li", props: {}, children: "b", key: "b" },
//   { tag: "li", props: {}, children: "c", key: "c" },
//   { tag: "li", props: {}, children: "d", key: "d" },
//   { tag: "li", props: {}, children: "e", key: "e" },
//   { tag: "li", props: {}, children: "f", key: "f" },
// ],

// ,
//     children: [
//       { tag: "li", props: {}, children: "a", key: "a" },
//       { tag: "li", props: {}, children: "d", key: "d" },
//       { tag: "li", props: {}, children: "b", key: "b" },
//       { tag: "li", props: {}, children: "e", key: "e" },
//       { tag: "li", props: {}, children: "c", key: "c" },
//     ],

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
  ],
};

render(vnode, document.querySelector("#app")!);

setTimeout(() => {
  const newVnode: VNode = {
    tag: "ul",
    props: {
      style: {
        color: "red",
      },
      onClick: () => {
        console.log(2);
      },
      class: "test2",
    },
    children: [
      { tag: "li", props: {}, children: "a", key: "a" },
      { tag: "li", props: {}, children: "c", key: "c" },
      { tag: "li", props: {}, children: "b", key: "b" },
      { tag: "li", props: {}, children: "d", key: "d" },
      { tag: "li", props: {}, children: "f", key: "f" },
      { tag: "li", props: {}, children: "e", key: "e" },
    ],
  };

  render(newVnode, document.querySelector("#app")!);
}, 1000);
