const eraWidget = new EraWidget();
let actions = null; // Store actions array directly
let isConfigured = false;

// Pending action for confirm popup
let pendingAction = {
  buttonIndex: null,
};

// Device names for confirm popup (only 1 device now)
let deviceNames = ["CB Tổng"];

// Settings configuration - prioritize URL params, fallback to localStorage
let deviceSettings = {
  deviceName: "CB Tổng",
};

// Get settings from URL parameters
function getUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    deviceName: urlParams.get("deviceName"),
    deviceId: urlParams.get("deviceId"), // For unique identification
  };
}

// URL parameter processing (backward compatibility)
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Debug function to show current URL parameters
function debugURLParameters() {
  const params = new URLSearchParams(window.location.search);
  console.log("=== URL Parameters Debug ===");
  console.log("Full URL:", window.location.href);
  console.log("Search params:", window.location.search);

  for (const [key, value] of params) {
    console.log(`${key}: ${decodeURIComponent(value)}`);
  }

  console.log("============================");
}

// Load settings from URL params first, then localStorage
function loadSettings() {
  const urlParams = getUrlParameters();
  const savedSettings = localStorage.getItem("deviceSettings");

  // Support backward compatibility with 'name' parameter
  const legacyName = getURLParameter("name");

  // Priority: URL params > localStorage > defaults
  if (urlParams.deviceName || legacyName) {
    // Use URL parameters (highest priority)
    deviceSettings = {
      deviceName:
        urlParams.deviceName || legacyName || deviceSettings.deviceName,
      deviceId: urlParams.deviceId || null,
    };
    console.log("Settings loaded from URL parameters:", deviceSettings);
  } else if (savedSettings) {
    // Fallback to localStorage
    try {
      deviceSettings = JSON.parse(savedSettings);
      console.log("Settings loaded from localStorage:", deviceSettings);
    } catch (e) {
      console.warn("Failed to load settings from localStorage:", e);
    }
  }

  updateUIWithSettings();
}

// Update UI with current settings
function updateUIWithSettings() {
  // Update device label
  const deviceLabelElement = document.querySelector(".device-label");
  if (deviceLabelElement) {
    deviceLabelElement.textContent = deviceSettings.deviceName;
  }

  // Update device name in confirm popup and array
  deviceNames[0] = deviceSettings.deviceName;
}

eraWidget.init({
  needRealtimeConfigs: false /* Không cần giá trị hiện thời */,
  needHistoryConfigs: false /* Không cần giá trị lịch sử */,
  maxActionsCount: 1 /* Số lượng tối đa các hành động có thể kích hoạt */,
  minHistoryConfigsCount: 0 /* Số lượng tối thiểu giá trị lịch sử */,
  minActionsCount: 1 /* Số lượng tối thiểu hành động */,
  mobileHeight: 200 /* Chiều cao của widget */,
  onConfiguration: (configuration) => {
    console.log("E-Ra Configuration received:", configuration);

    // Store actions array directly (following the pattern)
    actions = configuration.actions;
    console.log("Actions stored:", actions);

    isConfigured = true;
    console.log("Widget configured successfully");

    // Remove no-connection indicator when configured
    document.getElementById(`container-0`).classList.remove("no-connection");

    // Request initial data sync after configuration
    console.log("Requesting initial data sync...");
  },
});

function updateButtonUI(buttonIndex) {
  console.log(`updateButtonUI: buttonIndex=${buttonIndex}`);

  // Update all UI elements to always show SCAN
  const statusElement = document.getElementById(`status-${buttonIndex}`);
  const controlButtonElement = document.getElementById(
    `control-button-${buttonIndex}`
  );
  const hiddenButtonElement = document.getElementById(`button-${buttonIndex}`);

  // Always show SCAN text
  statusElement.textContent = "SCAN";
  controlButtonElement.textContent = "SCAN";
  hiddenButtonElement.textContent = "SCAN";
}

function toggleButton(buttonIndex) {
  // Simply trigger scan action
  showConfirmPopup(buttonIndex);
}

function showConfirmPopup(buttonIndex) {
  // Store pending action
  pendingAction.buttonIndex = buttonIndex;

  // Update popup content
  const confirmAction = document.getElementById("confirmAction");
  const confirmButton = document.getElementById("confirmButton");

  // Set action text and styling for SCAN
  confirmAction.textContent = "SCAN";
  confirmAction.className = "confirm-action";

  // Set confirm button styling
  confirmButton.className = "confirm-btn confirm";
  confirmButton.textContent = "Xác nhận";

  // Show popup
  const overlay = document.getElementById("confirmOverlay");
  overlay.classList.add("show");

  // Prevent body scroll
  document.body.style.overflow = "hidden";
}

function cancelConfirm() {
  // Hide popup
  const overlay = document.getElementById("confirmOverlay");
  overlay.classList.remove("show");

  // Restore body scroll
  document.body.style.overflow = "";

  // Clear pending action
  pendingAction.buttonIndex = null;
}

function executeAction() {
  // Execute the pending action
  if (pendingAction.buttonIndex !== null) {
    controlButton(pendingAction.buttonIndex);
  }

  // Hide popup
  cancelConfirm();
}

function controlButton(buttonIndex) {
  console.log(`controlButton called: buttonIndex=${buttonIndex}`);

  if (!isConfigured) {
    console.warn("Configuration pending - widget not ready");
    // Show container as no-connection
    document.getElementById(`container-0`).classList.add("no-connection");
    return;
  }

  // Check if actions array is available
  if (!actions || actions.length < 1) {
    console.warn("Actions not configured properly");
    return;
  }

  // Always use action at position [0] for SCAN
  const actionToTrigger = actions[0];
  console.log(`Action to trigger:`, actionToTrigger);

  if (actionToTrigger) {
    console.log("Triggering E-Ra SCAN action:", actionToTrigger);

    // Use E-Ra standard format with optional chaining
    eraWidget.triggerAction(actionToTrigger?.action, null);
  } else {
    console.warn(`No action config found at position [0]`);
  }
}

// Touch event handling for mobile devices
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".status, .control-button").forEach((element) => {
    let buttonIndex;

    // Get button index from element ID
    if (element.classList.contains("control-button")) {
      buttonIndex = parseInt(element.id.split("-")[2]);
    } else if (element.classList.contains("status")) {
      buttonIndex = parseInt(element.id.split("-")[1]);
    }

    // Add touch event
    element.addEventListener("touchend", (e) => {
      e.preventDefault();
      toggleButton(buttonIndex);
    });
  });

  // Close popup when clicking outside
  document
    .getElementById("confirmOverlay")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        cancelConfirm();
      }
    });

  // Handle Escape key to close popup
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      cancelConfirm();
    }
  });
});

// Initialize all buttons with loading state, wait for E-Ra data via onValues
document.addEventListener("DOMContentLoaded", function () {
  // Debug URL parameters
  debugURLParameters();

  // Load settings from URL parameters first, then localStorage
  loadSettings();

  // Show loading state initially
  // Show as no-connection until configured and data received
  document.getElementById(`container-0`).classList.add("no-connection");

  // Set initial UI state to show SCAN
  updateButtonUI(0);

  console.log("DOM loaded - waiting for E-Ra configuration...");

  // Add timeout fallback if no configuration received
  setTimeout(() => {
    if (isConfigured) {
      console.log("Widget configured and ready");
      // Remove no-connection indicator
      document.getElementById(`container-0`).classList.remove("no-connection");
    }
  }, 10000); // 10 second timeout for configuration
});
