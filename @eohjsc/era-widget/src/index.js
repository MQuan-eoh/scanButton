const ALLOW_ORIGINS_ERA = [
  "http://localhost:3000",
  "http://192.168.1.47:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://app.e-ra.io",
  "https://staging-app.e-ra.io",
  "https://ots.e-ra.io",
];
console.log("Allowed origins:", ALLOW_ORIGINS_ERA);

class EraWidget {
  constructor() {}

  init({
    origins = ALLOW_ORIGINS_ERA,
    onConfiguration,
    onValues,
    onHistories,
    ready = true,
    mobileHeight = null,
    needRealtimeConfigs = true,
    needHistoryConfigs = true,
    needActions = true,
    maxRealtimeConfigsCount = 0,
    maxHistoryConfigsCount = 0,
    maxActionsCount = 0,
    minRealtimeConfigsCount = 0,
    minHistoryConfigsCount = 0,
    minActionsCount = 0,
  }) {
    this.origins = origins;
    this.urlParams = new URLSearchParams(window.location.search);
    this.eraOrigin = this.urlParams.get("eraOrigin");
    this.eraWidgetId = parseInt(this.urlParams.get("eraWidget"), 10);
    this.onConfiguration = [onConfiguration];
    this.onValues = [onValues];
    this.onHistories = [onHistories];
    this.maxRealtimeConfigsCount = maxRealtimeConfigsCount;
    this.maxHistoryConfigsCount = maxHistoryConfigsCount;
    this.maxActionsCount = maxActionsCount;
    this.minRealtimeConfigsCount = minRealtimeConfigsCount;
    this.minHistoryConfigsCount = minHistoryConfigsCount;
    this.minActionsCount = minActionsCount;
    this.needRealtimeConfigs = needRealtimeConfigs;
    this.needHistoryConfigs = needHistoryConfigs;
    this.needActions = needActions;

    if (!this.origins.includes(this.eraOrigin)) {
      console.error("Invalid eraOrigin");
      return;
    }
    window.addEventListener("message", this.handleMessage.bind(this));

    if (ready) {
      this.ready();
    }
    if (mobileHeight) {
      this.requestAdjustMobileHeight(mobileHeight);
    }
  }

  handleMessage(event) {
    // iframe and webview
    if (
      event.origin !== this.eraOrigin &&
      event.origin !== window.location.origin
    )
      if (event.data?.source !== "eraIframeWidget") {
        return;
      }
    const { type, data } = event.data;
    switch (type) {
      case "configuration":
        this.configuration = data;
        this.triggerCallbacks(this.onConfiguration, data);
        break;
      case "values":
        this.triggerCallbacks(this.onValues, data);
        break;
      case "histories":
        this.triggerCallbacks(this.onHistories, data);
        break;
    }
  }

  triggerCallbacks(callbacks, data) {
    callbacks.forEach((cb) => cb(data));
  }

  on(event, callback) {
    switch (event) {
      case "configuration":
        this.onConfiguration.push(callback);
        break;
      case "values":
        this.onValues.push(callback);
        break;
      case "histories":
        this.onHistories.push(callback);
        break;
    }
  }

  off(event, callback) {
    switch (event) {
      case "configuration":
        this.onConfiguration = this.onConfiguration.filter(
          (cb) => cb !== callback
        );
        break;
      case "values":
        this.onValues = this.onValues.filter((cb) => cb !== callback);
        break;
      case "histories":
        this.onHistories = this.onHistories.filter((cb) => cb !== callback);
        break;
    }
  }

  requestHistories(startTime, endTime) {
    this.postMessage("requestHistories", [startTime, endTime]);
  }

  postMessage(type, data) {
    const message = {
      source: "eraIframeWidget",
      type,
      data,
      eraWidgetId: this.eraWidgetId,
    };

    if (window.parent !== window) {
      window.parent.postMessage(message, this.eraOrigin);
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  ready() {
    this.postMessage("ready", {
      needRealtimeConfigs: this.needRealtimeConfigs,
      needHistoryConfigs: this.needHistoryConfigs,
      needActions: this.needActions,
      maxRealtimeConfigsCount: this.maxRealtimeConfigsCount,
      maxHistoryConfigsCount: this.maxHistoryConfigsCount,
      maxActionsCount: this.maxActionsCount,
      minRealtimeConfigsCount: this.minRealtimeConfigsCount,
      minHistoryConfigsCount: this.minHistoryConfigsCount,
      minActionsCount: this.minActionsCount,
    });
  }

  requestAdjustMobileHeight(height) {
    this.postMessage("requestAdjustMobileHeight", height);
  }

  triggerAction(actionKey, actionIndex, data, silent = false) {
    this.postMessage("triggerAction", { actionKey, actionIndex, data, silent });
  }
}

try {
  module.exports = new EraWidget();
} catch (e) {
  window.eraWidget = new EraWidget();
}
