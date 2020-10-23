import { effect, ReactiveEffect, trigger, track } from "./effect";

export type ComputedGetter<T> = (ctx?: any) => T;

class ComputedRefImpl<T> {
  private _value!: T;
  private effect: ReactiveEffect;
  private _dirty = true;

  constructor(getter: ComputedGetter<T>) {
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, "value");
        }
      },
    });
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    track(this, "value");
    return this._value;
  }
}

export function computed<T>(getterOrOptions: ComputedGetter<T>) {
  let getter: ComputedGetter<T> = getterOrOptions;
  return new ComputedRefImpl(getter);
}
