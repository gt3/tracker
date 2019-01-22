import { Script, ScriptByEnvironment } from './types.api';
import { UserData } from './types.data';

let _isDomReady = false,
  loadedScripts = new Set();
const _ctx = Function('return this;')();
export const isBrowser = _ctx && _ctx === _ctx.window;
const _crypto = isBrowser && (_ctx.crypto || _ctx.msCrypto);
const _isIE = _crypto ? _crypto === _ctx.msCrypto : false;
export const isLocalhost = isBrowser && ['localhost', '127.0.0.1', ''].indexOf(_ctx.location.hostname.toLowerCase()) !== -1;

export function scriptExists(scriptMap: ScriptByEnvironment) {
  const scripts = _ctx.document.scripts;
  const targetScripts = flattenScripts(scriptMap).map(ts => ts.toLowerCase());
  let found = false;
  if (scripts) {
    for (let i = 0; i < scripts.length; i++) {
      let src = scripts[i].src;
      if (src && targetScripts.indexOf(src.toLowerCase()) !== -1) {
        found = true;
        break;
      }
    }
  }
  return found;
}

export function onDomReady() {
  return new Promise((resolve, reject) => {
    if (_isDomReady) return resolve();
    if (!isBrowser) return reject(new Error('Attempt to invoke dom functionality in a non-browser environment.'));
    document.addEventListener('DOMContentLoaded', () => {
      _isDomReady = true;
      resolve();
    });
  });
}

export function injectScript(script: Script) {
  const { src, integrity, crossorigin = 'anonymous' } = script;
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      return reject(new Error('Attempt to invoke dom functionality in a non-browser environment.'));
    }
    if (loadedScripts.has(src)) {
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
    if (integrity) {
      script.integrity = integrity;
      script.crossorigin = crossorigin;
    }
    document.head.appendChild(script);
  });
}

/**
 *
 * @param fns functions to pipe (left -> right)
 */
export function pipe(...fns: Function[]) {
  function invoke(val: any) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), val);
  }
  return invoke;
}

/**
 * Memoize function call for fn that accepts one string argument
 */
export function memo1(fn: Function, checkResult?: (val: any) => boolean) {
  const cache = new Map();
  function wrapper(arg: string) {
    if (cache.has(arg)) return cache.get(arg);
    const res = fn.call(this, arg);
    if (!checkResult || checkResult(res)) cache.set(arg, res);
    return res;
  }
  return wrapper;
}

export function flatten1(arr: any[]) {
  return arr.reduce((acc, cur) => {
    if (Array.isArray(cur)) acc.push(...cur);
    else acc.push(cur);
    return acc;
  }, []);
}

function flattenScripts(scriptMap: any) {
  return Object.keys(scriptMap).reduce((acc: any[], key) => {
    let srcs = scriptMap[key].map((s: any) => s.src);
    acc.push(...srcs);
    return acc;
  }, []);
}

const _localhostTrackingKey = '__localhostTracking__';

const _localhostTracking = {
  on: () => _ctx.sessionStorage.setItem(_localhostTrackingKey, true),
  status: () => _ctx.sessionStorage.getItem(_localhostTrackingKey),
  clear: () => _ctx.sessionStorage.removeItem(_localhostTrackingKey)
};

export const isLocalhostTrackingEnabled = () => !!_localhostTracking.status();

(function selfRegister() {
  if (isBrowser && isLocalhost) {
    onDomReady().then(() => {
      if (!isLocalhostTrackingEnabled()) {
        console.warn(`Use window.localhostTracking.on() to turn on tracking on ${_ctx.location.hostname}.`);
      }
      _ctx.localhostTracking = _localhostTracking;
    });
  }
})();

export function digest(msg: string) {
  const algo = 'SHA-256';
  const msgBuffer = toArrayBuffer(msg);
  if (_isIE) {
    return digestIE(msgBuffer);
  } else {
    return _crypto.subtle.digest(algo, msgBuffer).then((msgDigest: ArrayBuffer) => toString(msgDigest));
  }
}

export function hashUserId(userData: UserData): Promise<UserData> {
  if (!userData.userId || !crypto) return Promise.resolve(userData);
  return digest(userData.userId).then((hashedUserId: string) => {
    return { ...userData, userId: hashedUserId };
  });
}

function digestIE(msg: ArrayBuffer) {
  const algo = 'SHA-1';
  return new Promise((resolve, reject) => {
    let ieOp = _crypto.subtle.digest({ name: algo }, msg);
    ieOp.onerror = () => {
      reject(new Error(`Could not create hash.`));
    };
    ieOp.oncomplete = (e: any) => {
      // @ts-ignore
      let msgDigest = e.target.result;
      resolve(toString(msgDigest));
    };
  });
}

function toArrayBuffer(str: String): ArrayBuffer {
  if (!_isIE) return new _ctx.TextEncoder().encode(str);
  var output = new Uint8Array(str.length),
    p = 0;
  for (var i = 0; i < str.length; i++) {
    var curr = str.charCodeAt(i);
    if (curr > 0xff) {
      output[p++] = curr & 0xff;
      curr >>= 8;
    }
    output[p++] = curr;
  }
  return output.buffer;
}

const hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

function toHex(byte: number) {
  return hex[(byte >> 4) & 0x0f] + hex[byte & 0x0f];
}

function toString(buffer: ArrayBuffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), toHex).join('');
}
