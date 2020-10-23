import { render } from "./runtime-core/renderer";
import { reactive } from "./reactivity/reactivity";
import { effect } from "./reactivity/effect";
import { VNode } from "./types";
import { ref } from "./reactivity/ref";
import { computed } from "./reactivity/computed";

const state = reactive({ name: "tqh", age: 26 });

const refValue = ref(1);
const computedValue = computed(() => state.age + 2);

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
          style: { color: "blue" },
          onClick: () => {
            state.age++;
            refValue.value = refValue.value + 1;
          },
        },
        children: `ref = ${refValue.value}  , computedValue = ${computedValue.value}`,
      },
    ],
  };

  render(vnode, document.querySelector("#app")!);
});
