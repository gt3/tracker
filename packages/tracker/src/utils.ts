import { Script } from "./vendor";

let _isDomReady = false, loadedScripts = new Set();
const _ctx = Function('return this;')();
export const isBrowser = _ctx && _ctx === _ctx.window;

export function getInstance<T>(projectKey?: string): T {
  const instance = _ctx['amplitude'];
  return instance && (projectKey ? instance.getInstance(projectKey) : instance.getInstance());
};

export function onDomReady() {
  return new Promise((resolve, reject) => {
    if(_isDomReady) return resolve();
    if(!isBrowser) return reject(new Error("Attempt to invoke dom functionality in a non-browser environment."));
    document.addEventListener('DOMContentLoaded', () => {
      _isDomReady = true;
      resolve();
    });
  });
}

export function injectScript(script: Script) {
  const { src, integrity } = script;
  return new Promise((resolve, reject) => {
    if(!isBrowser) {
      return reject(new Error("Attempt to invoke dom functionality in a non-browser environment."));
    }
    if(loadedScripts.has(src)) {
      return resolve();
    }
    const loaded = () => {
      loadedScripts.add(src);
      resolve();
    };
    const failed = (err: Error) => {
      reject(err);
    };
    const script = _ctx.document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = loaded;
    script.onerror = failed;
    document.head.appendChild(script);
  });
}

export function flatten1(arr: any[]) {
  return arr.reduce((acc, cur) => {
    if(Array.isArray(cur)) acc.push(...cur);
    else acc.push(cur);
    return acc;
  }, []);
}
