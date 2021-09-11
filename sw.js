"use strict";
const OFFLINE_DATA_FILE = "offline.js",
    CACHE_NAME_PREFIX = "c2offline",
    BROADCASTCHANNEL_NAME = "offline",
    CONSOLE_PREFIX = "[SW] ",
    LAZYLOAD_KEYNAME = "",
    broadcastChannel = "undefined" == typeof BroadcastChannel ? null : new BroadcastChannel("offline");

function PostBroadcastMessage(e) {
    broadcastChannel && setTimeout(() => broadcastChannel.postMessage(e), 3e3)
}

function Broadcast(e) {
    PostBroadcastMessage({
        type: e
    })
}

function BroadcastDownloadingUpdate(e) {
    PostBroadcastMessage({
        type: "downloading-update",
        version: e
    })
}

function BroadcastUpdateReady(e) {
    PostBroadcastMessage({
        type: "update-ready",
        version: e
    })
}

function IsUrlInLazyLoadList(e, t) {
    if (!t) return !1;
    try {
        for (const a of t)
            if (new RegExp(a).test(e)) return !0
    } catch (e) {
        console.error(CONSOLE_PREFIX + "Error matching in lazy-load list: ", e)
    }
    return !1
}

function WriteLazyLoadListToStorage(e) {
    return "undefined" == typeof localforage ? Promise.resolve() : localforage.setItem(LAZYLOAD_KEYNAME, e)
}

function ReadLazyLoadListFromStorage() {
    return "undefined" == typeof localforage ? Promise.resolve([]) : localforage.getItem(LAZYLOAD_KEYNAME)
}

function GetCacheBaseName() {
    return CACHE_NAME_PREFIX + "-" + self.registration.scope
}

function GetCacheVersionName(e) {
    return GetCacheBaseName() + "-v" + e
}
async function GetAvailableCacheNames() {
    const e = await caches.keys(),
        t = GetCacheBaseName();
    return e.filter(e => e.startsWith(t))
}
async function IsUpdatePending() {
    return (await GetAvailableCacheNames()).length >= 2
}
async function GetMainPageUrl() {
    const e = await clients.matchAll({
        includeUncontrolled: !0,
        type: "window"
    });
    for (const t of e) {
        let e = t.url;
        if (e.startsWith(self.registration.scope) && (e = e.substring(self.registration.scope.length)), e && "/" !== e) return e.startsWith("?") && (e = "/" + e), e
    }
    return ""
}

function fetchWithBypass(e, t) {
    if ("string" == typeof e && (e = new Request(e)), t) {
        const t = new URL(e.url);
        return t.search += Math.floor(1e6 * Math.random()), fetch(t, {
            headers: e.headers,
            mode: e.mode,
            credentials: e.credentials,
            redirect: e.redirect,
            cache: "no-store"
        })
    }
    return fetch(e)
}
async function CreateCacheFromFileList(e, t, a) {
    const n = await Promise.all(t.map(e => fetchWithBypass(e, a)));
    let o = !0;
    for (const e of n) e.ok || (o = !1, console.error(CONSOLE_PREFIX + "Error fetching '" + e.url + "' (" + e.status + " " + e.statusText + ")"));
    if (!o) throw new Error("not all resources were fetched successfully");
    const r = await caches.open(e);
    try {
        return await Promise.all(n.map((e, a) => r.put(t[a], e)))
    } catch (t) {
        throw console.error(CONSOLE_PREFIX + "Error writing cache entries: ", t), caches.delete(e), t
    }
}
async function UpdateCheck(e) {
    try {
        const t = await fetchWithBypass(OFFLINE_DATA_FILE, !0);
        if (!t.ok) throw new Error(OFFLINE_DATA_FILE + " responded with " + t.status + " " + t.statusText);
        const a = await t.json(),
            n = a.version,
            o = a.fileList,
            r = a.lazyLoad,
            s = GetCacheVersionName(n);
        if (await caches.has(s)) return void(await IsUpdatePending() ? (console.log(CONSOLE_PREFIX + "Update pending"), Broadcast("update-pending")) : (console.log(CONSOLE_PREFIX + "Up to date"), Broadcast("up-to-date")));
        const i = await GetMainPageUrl();
        o.unshift("./"), i && -1 === o.indexOf(i) && o.unshift(i), console.log(CONSOLE_PREFIX + "Caching " + o.length + " files for offline use"), e ? Broadcast("downloading") : BroadcastDownloadingUpdate(n), r && await WriteLazyLoadListToStorage(r), await CreateCacheFromFileList(s, o, !e), await IsUpdatePending() ? (console.log(CONSOLE_PREFIX + "All resources saved, update ready"), BroadcastUpdateReady(n)) : (console.log(CONSOLE_PREFIX + "All resources saved, offline support ready"), Broadcast("offline-ready"))
    } catch (e) {
        console.warn(CONSOLE_PREFIX + "Update check failed: ", e)
    }
}
async function GetCacheNameToUse(e, t) {
    if (1 === e.length || !t) return e[0];
    if ((await clients.matchAll()).length > 1) return e[0];
    const a = e[e.length - 1];
    return console.log(CONSOLE_PREFIX + "Updating to new version"), await Promise.all(e.slice(0, -1).map(e => caches.delete(e))), a
}
async function HandleFetch(e, t) {
    const a = await GetAvailableCacheNames();
    if (!a.length) return fetch(e.request);
    const n = await GetCacheNameToUse(a, t),
        o = await caches.open(n),
        r = await o.match(e.request);
    if (r) return r;
    const s = await Promise.all([fetch(e.request), ReadLazyLoadListFromStorage()]),
        i = s[0],
        c = s[1];
    if (IsUrlInLazyLoadList(e.request.url, c)) try {
        await o.put(e.request, i.clone())
    } catch (t) {
        console.warn(CONSOLE_PREFIX + "Error caching '" + e.request.url + "': ", t)
    }
    return i
}
self.addEventListener("install", e => {
    e.waitUntil(UpdateCheck(!0).catch(() => null))
}), self.addEventListener("fetch", e => {
    if (new URL(e.request.url).origin !== location.origin) return;
    const t = "navigate" === e.request.mode,
        a = HandleFetch(e, t);
    t && e.waitUntil(a.then(() => UpdateCheck(!1))), e.respondWith(a)
});