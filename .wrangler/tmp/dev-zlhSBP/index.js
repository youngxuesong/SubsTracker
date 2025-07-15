(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // .wrangler/tmp/bundle-sQOpRk/checked-fetch.js
  var urls = /* @__PURE__ */ new Set();
  function checkURL(request, init) {
    const url = request instanceof URL ? request : new URL(
      (typeof request === "string" ? new Request(request, init) : request).url
    );
    if (url.port && url.port !== "443" && url.protocol === "https:") {
      if (!urls.has(url.toString())) {
        urls.add(url.toString());
        console.warn(
          `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
        );
      }
    }
  }
  __name(checkURL, "checkURL");
  globalThis.fetch = new Proxy(globalThis.fetch, {
    apply(target, thisArg, argArray) {
      const [request, init] = argArray;
      checkURL(request, init);
      return Reflect.apply(target, thisArg, argArray);
    }
  });

  // C:/Users/young/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
  var __facade_middleware__ = [];
  function __facade_register__(...args) {
    __facade_middleware__.push(...args.flat());
  }
  __name(__facade_register__, "__facade_register__");
  function __facade_registerInternal__(...args) {
    __facade_middleware__.unshift(...args.flat());
  }
  __name(__facade_registerInternal__, "__facade_registerInternal__");
  function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
    const [head, ...tail] = middlewareChain;
    const middlewareCtx = {
      dispatch,
      next(newRequest, newEnv) {
        return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
      }
    };
    return head(request, env, ctx, middlewareCtx);
  }
  __name(__facade_invokeChain__, "__facade_invokeChain__");
  function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
    return __facade_invokeChain__(request, env, ctx, dispatch, [
      ...__facade_middleware__,
      finalMiddleware
    ]);
  }
  __name(__facade_invoke__, "__facade_invoke__");

  // C:/Users/young/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/loader-sw.ts
  var __FACADE_EVENT_TARGET__;
  if (globalThis.MINIFLARE) {
    __FACADE_EVENT_TARGET__ = new (Object.getPrototypeOf(WorkerGlobalScope))();
  } else {
    __FACADE_EVENT_TARGET__ = new EventTarget();
  }
  function __facade_isSpecialEvent__(type) {
    return type === "fetch" || type === "scheduled";
  }
  __name(__facade_isSpecialEvent__, "__facade_isSpecialEvent__");
  var __facade__originalAddEventListener__ = globalThis.addEventListener;
  var __facade__originalRemoveEventListener__ = globalThis.removeEventListener;
  var __facade__originalDispatchEvent__ = globalThis.dispatchEvent;
  globalThis.addEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.addEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalAddEventListener__(type, listener, options);
    }
  };
  globalThis.removeEventListener = function(type, listener, options) {
    if (__facade_isSpecialEvent__(type)) {
      __FACADE_EVENT_TARGET__.removeEventListener(
        type,
        listener,
        options
      );
    } else {
      __facade__originalRemoveEventListener__(type, listener, options);
    }
  };
  globalThis.dispatchEvent = function(event) {
    if (__facade_isSpecialEvent__(event.type)) {
      return __FACADE_EVENT_TARGET__.dispatchEvent(event);
    } else {
      return __facade__originalDispatchEvent__(event);
    }
  };
  globalThis.addMiddleware = __facade_register__;
  globalThis.addMiddlewareInternal = __facade_registerInternal__;
  var __facade_waitUntil__ = Symbol("__facade_waitUntil__");
  var __facade_response__ = Symbol("__facade_response__");
  var __facade_dispatched__ = Symbol("__facade_dispatched__");
  var __Facade_ExtendableEvent__ = class ___Facade_ExtendableEvent__ extends Event {
    static {
      __name(this, "__Facade_ExtendableEvent__");
    }
    [__facade_waitUntil__] = [];
    waitUntil(promise) {
      if (!(this instanceof ___Facade_ExtendableEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this[__facade_waitUntil__].push(promise);
    }
  };
  var __Facade_FetchEvent__ = class ___Facade_FetchEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_FetchEvent__");
    }
    #request;
    #passThroughOnException;
    [__facade_response__];
    [__facade_dispatched__] = false;
    constructor(type, init) {
      super(type);
      this.#request = init.request;
      this.#passThroughOnException = init.passThroughOnException;
    }
    get request() {
      return this.#request;
    }
    respondWith(response) {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      if (this[__facade_response__] !== void 0) {
        throw new DOMException(
          "FetchEvent.respondWith() has already been called; it can only be called once.",
          "InvalidStateError"
        );
      }
      if (this[__facade_dispatched__]) {
        throw new DOMException(
          "Too late to call FetchEvent.respondWith(). It must be called synchronously in the event handler.",
          "InvalidStateError"
        );
      }
      this.stopImmediatePropagation();
      this[__facade_response__] = response;
    }
    passThroughOnException() {
      if (!(this instanceof ___Facade_FetchEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#passThroughOnException();
    }
  };
  var __Facade_ScheduledEvent__ = class ___Facade_ScheduledEvent__ extends __Facade_ExtendableEvent__ {
    static {
      __name(this, "__Facade_ScheduledEvent__");
    }
    #scheduledTime;
    #cron;
    #noRetry;
    constructor(type, init) {
      super(type);
      this.#scheduledTime = init.scheduledTime;
      this.#cron = init.cron;
      this.#noRetry = init.noRetry;
    }
    get scheduledTime() {
      return this.#scheduledTime;
    }
    get cron() {
      return this.#cron;
    }
    noRetry() {
      if (!(this instanceof ___Facade_ScheduledEvent__)) {
        throw new TypeError("Illegal invocation");
      }
      this.#noRetry();
    }
  };
  __facade__originalAddEventListener__("fetch", (event) => {
    const ctx = {
      waitUntil: event.waitUntil.bind(event),
      passThroughOnException: event.passThroughOnException.bind(event)
    };
    const __facade_sw_dispatch__ = /* @__PURE__ */ __name(function(type, init) {
      if (type === "scheduled") {
        const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
          scheduledTime: Date.now(),
          cron: init.cron ?? "",
          noRetry() {
          }
        });
        __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
        event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      }
    }, "__facade_sw_dispatch__");
    const __facade_sw_fetch__ = /* @__PURE__ */ __name(function(request, _env, ctx2) {
      const facadeEvent = new __Facade_FetchEvent__("fetch", {
        request,
        passThroughOnException: ctx2.passThroughOnException
      });
      __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
      facadeEvent[__facade_dispatched__] = true;
      event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
      const response = facadeEvent[__facade_response__];
      if (response === void 0) {
        throw new Error("No response!");
      }
      return response;
    }, "__facade_sw_fetch__");
    event.respondWith(
      __facade_invoke__(
        event.request,
        globalThis,
        ctx,
        __facade_sw_dispatch__,
        __facade_sw_fetch__
      )
    );
  });
  __facade__originalAddEventListener__("scheduled", (event) => {
    const facadeEvent = new __Facade_ScheduledEvent__("scheduled", {
      scheduledTime: event.scheduledTime,
      cron: event.cron,
      noRetry: event.noRetry.bind(event)
    });
    __FACADE_EVENT_TARGET__.dispatchEvent(facadeEvent);
    event.waitUntil(Promise.all(facadeEvent[__facade_waitUntil__]));
  });

  // C:/Users/young/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
  var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } finally {
      try {
        if (request.body !== null && !request.bodyUsed) {
          const reader = request.body.getReader();
          while (!(await reader.read()).done) {
          }
        }
      } catch (e) {
        console.error("Failed to drain the unused request body.", e);
      }
    }
  }, "drainBody");
  var middleware_ensure_req_body_drained_default = drainBody;

  // C:/Users/young/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
  function reduceError(e) {
    return {
      name: e?.name,
      message: e?.message ?? String(e),
      stack: e?.stack,
      cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
    };
  }
  __name(reduceError, "reduceError");
  var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
    try {
      return await middlewareCtx.next(request, env);
    } catch (e) {
      const error = reduceError(e);
      return Response.json(error, {
        status: 500,
        headers: { "MF-Experimental-Error-Stack": "true" }
      });
    }
  }, "jsonError");
  var middleware_miniflare3_json_error_default = jsonError;

  // .wrangler/tmp/bundle-sQOpRk/middleware-insertion-facade.js
  __facade_registerInternal__([middleware_ensure_req_body_drained_default, middleware_miniflare3_json_error_default]);

  // node_modules/itty-router/index.mjs
  var t = /* @__PURE__ */ __name(({ base: e = "", routes: t2 = [], ...r2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((r3, o2, a, s) => (r4, ...c) => t2.push([o2.toUpperCase?.(), RegExp(`^${(s = (e + r4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), c, s]) && a, "get") }), routes: t2, ...r2, async fetch(e2, ...o2) {
    let a, s, c = new URL(e2.url), n = e2.query = { __proto__: null };
    for (let [e3, t3] of c.searchParams) n[e3] = n[e3] ? [].concat(n[e3], t3) : t3;
    e: try {
      for (let t3 of r2.before || []) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break e;
      t: for (let [r3, n2, l, i] of t2) if ((r3 == e2.method || "ALL" == r3) && (s = c.pathname.match(n2))) {
        e2.params = s.groups || {}, e2.route = i;
        for (let t3 of l) if (null != (a = await t3(e2.proxy ?? e2, ...o2))) break t;
      }
    } catch (t3) {
      if (!r2.catch) throw t3;
      a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
    }
    try {
      for (let t3 of r2.finally || []) a = await t3(a, e2.proxy ?? e2, ...o2) ?? a;
    } catch (t3) {
      if (!r2.catch) throw t3;
      a = await r2.catch(t3, e2.proxy ?? e2, ...o2);
    }
    return a;
  } }), "t");
  var r = /* @__PURE__ */ __name((e = "text/plain; charset=utf-8", t2) => (r2, o2 = {}) => {
    if (void 0 === r2 || r2 instanceof Response) return r2;
    const a = new Response(t2?.(r2) ?? r2, o2.url ? void 0 : o2);
    return a.headers.set("content-type", e), a;
  }, "r");
  var o = r("application/json; charset=utf-8", JSON.stringify);
  var p = r("text/plain; charset=utf-8", String);
  var f = r("text/html");
  var u = r("image/jpeg");
  var h = r("image/png");
  var g = r("image/webp");

  // src/telegram.js
  async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      ...options
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("Failed to send message:", await response.text());
    }
    return response;
  }
  __name(sendMessage, "sendMessage");
  async function editMessageText(chatId, messageId, text, options = {}) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
    const payload = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "Markdown",
      ...options
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("Failed to edit message:", await response.text());
    }
    return response;
  }
  __name(editMessageText, "editMessageText");
  async function answerCallbackQuery(callbackQueryId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    const payload = {
      callback_query_id: callbackQueryId,
      text
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("Failed to answer callback query:", await response.text());
    }
  }
  __name(answerCallbackQuery, "answerCallbackQuery");

  // src/commands/start.js
  async function handleStart(chatId) {
    const message = `\u{1F389} Welcome to SubsTrackerBot! \u{1F389}

I can help you keep track of all your subscriptions.`;
    const keyboard = {
      inline_keyboard: [
        [
          { text: "\u{1F4CB} View Subscriptions", callback_data: "list" },
          { text: "\u2795 Add Subscription", callback_data: "info" }
        ]
      ]
    };
    await sendMessage(chatId, message, { reply_markup: JSON.stringify(keyboard) });
  }
  __name(handleStart, "handleStart");

  // src/kv.js
  async function listSubscriptions(chatId) {
    const data = await DB.get(chatId.toString(), { type: "json" });
    return data || [];
  }
  __name(listSubscriptions, "listSubscriptions");
  async function addSubscription(chatId, subscription) {
    const subs = await listSubscriptions(chatId);
    subs.push(subscription);
    await DB.put(chatId.toString(), JSON.stringify(subs));
  }
  __name(addSubscription, "addSubscription");
  async function deleteSubscription(chatId, index) {
    const subs = await listSubscriptions(chatId);
    if (index >= 0 && index < subs.length) {
      subs.splice(index, 1);
      await DB.put(chatId.toString(), JSON.stringify(subs));
      return true;
    }
    return false;
  }
  __name(deleteSubscription, "deleteSubscription");

  // src/commands/add.js
  async function handleAdd(chatId, text) {
    const parts = text.split(" ");
    if (parts.length !== 4) {
      await sendMessage(chatId, "Oops! It looks like the format is wrong. Please use: /add <name> <amount> <date>");
      return;
    }
    const [, name, amount, date] = parts;
    const subscription = { name, amount, date };
    await addSubscription(chatId, subscription);
    await sendMessage(chatId, `\u2705 Subscription added successfully!

*Name:* ${name}
*Amount:* ${amount}
*Date:* ${date}`);
  }
  __name(handleAdd, "handleAdd");

  // src/commands/list.js
  async function handleList(chatId, messageId) {
    const subs = await listSubscriptions(chatId);
    if (subs.length === 0) {
      const message2 = "You have no subscriptions yet. Try adding one with /add!";
      if (messageId) {
        await editMessageText(chatId, messageId, message2, { reply_markup: JSON.stringify({ inline_keyboard: [[{ text: "\u2795 Add Subscription", callback_data: "info" }]] }) });
      } else {
        await sendMessage(chatId, message2, { reply_markup: JSON.stringify({ inline_keyboard: [[{ text: "\u2795 Add Subscription", callback_data: "info" }]] }) });
      }
      return;
    }
    const message = "Here are your subscriptions:";
    const keyboard = {
      inline_keyboard: subs.map((s, i) => [
        {
          text: `*${s.name}* - ${s.amount} - ${s.date}`,
          callback_data: `noop_${i}`
        },
        {
          text: "\u{1F5D1}\uFE0F Delete",
          callback_data: `delete_${i}`
        }
      ])
    };
    if (messageId) {
      await editMessageText(chatId, messageId, message, { reply_markup: JSON.stringify(keyboard) });
    } else {
      await sendMessage(chatId, message, { reply_markup: JSON.stringify(keyboard) });
    }
  }
  __name(handleList, "handleList");

  // src/commands/delete.js
  async function handleDelete(chatId, callbackQuery) {
    const index = parseInt(callbackQuery.data.split("_")[1], 10);
    const deleted = await deleteSubscription(chatId, index);
    if (deleted) {
      await answerCallbackQuery(callbackQuery.id, "\u2705 Subscription deleted successfully.");
      await handleList(chatId, callbackQuery.message.message_id);
    } else {
      await answerCallbackQuery(callbackQuery.id, "\u274C Failed to delete subscription. Please try again.");
    }
  }
  __name(handleDelete, "handleDelete");

  // src/commands/info.js
  async function handleInfo(chatId) {
    const message = "To add a new subscription, use the following format:\n\n`/add <name> <amount> <date>`\n\nFor example:\n`/add Netflix 15.99 2023-12-25`";
    await sendMessage(chatId, message);
  }
  __name(handleInfo, "handleInfo");

  // src/cron.js
  async function handleCron2() {
    const chatIds = [];
    for (const chatId of chatIds) {
      const subs = await listSubscriptions(chatId);
      const today = /* @__PURE__ */ new Date();
      for (const sub of subs) {
        const subDate = new Date(sub.date);
        const diffTime = Math.abs(subDate - today);
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        if (diffDays <= 3) {
          await sendMessage(
            chatId,
            `Your subscription for ${sub.name} is due on ${sub.date}.`
          );
        }
      }
    }
  }
  __name(handleCron2, "handleCron");

  // src/handler.js
  var router = t();
  router.post("/", async (request) => {
    const { message, callback_query } = await request.json();
    if (message) {
      const { chat, text } = message;
      const command = text.split(" ")[0];
      switch (command) {
        case "/start":
          await handleStart(chat.id);
          break;
        case "/add":
          await handleAdd(chat.id, text);
          break;
        case "/list":
          await handleList(chat.id);
          break;
        default:
          break;
      }
    } else if (callback_query) {
      const { from, data, message: message2 } = callback_query;
      const command = data.split("_")[0];
      switch (command) {
        case "list":
          await handleList(from.id, message2.message_id);
          break;
        case "info":
          await handleInfo(from.id);
          break;
        case "delete":
          await handleDelete(from.id, callback_query);
          break;
        default:
          break;
      }
    }
    return new Response("OK");
  });
  router.get("/cron", async () => {
    await handleCron2();
    return new Response("Cron job executed");
  });
  function handleRequest(request) {
    return router.handle(request);
  }
  __name(handleRequest, "handleRequest");

  // index.js
  addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
  });
  addEventListener("scheduled", (event) => {
    event.waitUntil(handleCron());
  });
})();
//# sourceMappingURL=index.js.map
