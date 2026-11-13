import {
  import_shim
} from "chunk-5NOKKKK2";
import "chunk-XL6B45XM";

// node_modules/wouter/src/use-hash-location.js
var listeners = [];
var onHashChange = () => listeners.forEach((cb) => cb());
var subscribeToHashUpdates = (callback) => {
  if (listeners.push(callback) === 1)
    addEventListener("hashchange", onHashChange);
  return () => {
    listeners = listeners.filter((i) => i !== callback);
    if (!listeners.length)
      removeEventListener("hashchange", onHashChange);
  };
};
var hashPrefix = /^#?\/?/;
var currentHashLocation = () => "/" + location.hash.replace(hashPrefix, "");
var navigate = (to, { state = null, replace = false } = {}) => {
  const oldURL = location.href;
  const [hash, search] = to.replace(hashPrefix, "").split("?");
  const url = new URL(oldURL);
  url.hash = `/${hash}`;
  if (search !== void 0)
    url.search = search;
  const newURL = url.href;
  history[replace ? "replaceState" : "pushState"](state, "", newURL);
  const event = typeof HashChangeEvent !== "undefined" ? new HashChangeEvent("hashchange", { oldURL, newURL }) : new Event("hashchange", { detail: { oldURL, newURL } });
  dispatchEvent(event);
};
var useHashLocation = ({ ssrPath = "/" } = {}) => [
  (0, import_shim.useSyncExternalStore)(
    subscribeToHashUpdates,
    currentHashLocation,
    () => ssrPath
  ),
  navigate
];
useHashLocation.hrefs = (href) => "#" + href;
export {
  navigate,
  useHashLocation
};
//# sourceMappingURL=wouter_use-hash-location.js.map
