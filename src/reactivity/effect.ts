type Dep = Set<ReactiveEffect>;
type KeyToDepMap = Map<any, Dep>;

// 用来存储依赖（effect）
const targetMap = new WeakMap<any, KeyToDepMap>();

export interface ReactiveEffectOptions {
  lazy?: boolean;
  onTrack?: (event: any) => void;
  onTrigger?: (event: any) => void;
  onStop?: () => void;
  scheduler?: (job: ReactiveEffect) => void;
}

export interface ReactiveEffect<T = any> {
  (): T;
  _isEffect: true;
  active: boolean;
  deps: Array<Dep>;
  options: ReactiveEffectOptions;
}

export let activeEffect: ReactiveEffect | undefined;

export const effect = <T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
) => {
  const _effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    _effect();
  }

  return _effect;
};

export const createReactiveEffect = <T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = {}
): ReactiveEffect<T> => {
  const effect = function(): unknown {
    try {
      activeEffect = effect;
      // fn执行的是render函数，内部会处理vnode，并且会对数据做响应式处理
      return fn();
    } finally {
      // 执行完后，要把effect置为null
      activeEffect && (activeEffect = null as any);
    }
  } as ReactiveEffect;

  effect._isEffect = true;
  effect.active = true;
  effect.deps = [];
  effect.options = options;
  return effect;
};

/**
 *
 * 举个例子
 * 比如target = {name: 'tqh', age: 26}
 * 那么depsMap的格式应该是这样的:
 *   {
 *     {name: 'tqh', age: 26}: {
 *       name: [effect1, effect2],
 *       age: [effect1, effect2]
 *     }
 *   }
 *
 */
export const track = (target: object, key: unknown) => {
  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    // 防止重复的effect
    dep = new Set();
    depsMap.set(key, dep);
  }

  if (activeEffect && !dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
};

export const trigger = (target: object, key: unknown) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effects = depsMap.get(key);

  if (effects) {
    effects.forEach((eff) => {
      if (eff.options.scheduler) {
        eff.options.scheduler(eff);
      } else {
        eff();
      }
    });
  }
};
