import { render } from "./runtime-core/renderer";
import { reactive } from "./reactivity/reactivity";
import { effect } from "./reactivity/effect";
import { VNode } from "./types";

const state = reactive({ name: "tqh", age: 26 });

const customCom = {
  setup(props, context) {
    return () => ({
      tag: "div",
      props: { style: { color: "#000" }, onClick: () => state.age++ },
      children: "年龄：" + state.age,
    });
  },
};

effect(() => {
  const vnode: VNode = {
    tag: "div",
    props: {
      style: {
        color: "red",
        border: "1px solid #2c38eb",
        marginBottom: "10px",
      },
    },
    children: [
      {
        tag: "p",
        props: {
          style: { color: "red" },
          onClick: () => {
            state.name = "ttt";
          },
        },
        children: "姓名：" + state.name,
      },
      {
        tag: customCom,
      },
    ],
  };

  render(vnode, document.querySelector("#app")!);
});
