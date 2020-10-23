import { track, trigger } from "./effect";

class RefImpl<T> {
  private _value: T;
  constructor(rawValue: T) {
    this._value = rawValue;
  }

  get value() {
    track(this, "value");
    return this._value;
  }

  set value(newValue) {
    this._value = newValue;
    trigger(this, "value");
  }
}

export function ref(value?: unknown) {
  return new RefImpl(value);
}
