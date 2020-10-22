import { track, trigger } from "./effect";
export function reactive(target: object) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);

      // 收集依赖
      track(target, key);

      if (Object.prototype.toString.call(res) === "[object Object]") {
        reactive(res);
      }

      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = (target as any)[key];
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);

      return result;
    },
  });
}
