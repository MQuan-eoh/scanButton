const eraWidget = new EraWidget();
let actions = null; // Store actions array directly
let configDevice = null; // Store realtime config directly
let isConfigured = false;
let initialDataLoaded = false;

// Button states - track locally (only 1 button now)
let buttonStates = [false];

// Pending action for confirm popup
let pendingAction = {
  buttonIndex: null,
  isOn: null,
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
  needRealtimeConfigs: true /* Cần giá trị hiện thời */,
  needHistoryConfigs: false /* Không cần giá trị lịch sử */,
  maxActionsCount: 2 /* Số lượng tối đa các hành động có thể kích hoạt */,
  minHistoryConfigsCount: 0 /* Số lượng tối thiểu giá trị lịch sử */,
  minActionsCount: 2 /* Số lượng tối thiểu hành động */,
  mobileHeight: 200 /* Chiều cao của widget */,
  onConfiguration: (configuration) => {
    console.log("E-Ra Configuration received:", configuration);

    // Store actions array directly (following the pattern)
    actions = configuration.actions;
    console.log("Actions stored:", actions);

    // Store realtime config directly (following the pattern)
    configDevice = configuration.realtime_configs[0];
    console.log("Device config stored:", configDevice);

    isConfigured = true;
    console.log("Widget configured successfully");

    // Remove no-connection indicator when configured
    document.getElementById(`container-0`).classList.remove("no-connection");

    // Request initial data sync after configuration
    console.log("Requesting initial data sync...");
  },

  onValues: (values) => {
    console.log("E-Ra values received:", values);

    // Update button states based on received values
    if (values && typeof values === "object" && configDevice) {
      // Get device value using the stored config
      if (values[configDevice.id]) {
        const serverValue = values[configDevice.id].value;
        // Check if value is 10, 11, or 30 for ON state, else OFF
        const isOn =
          serverValue === 10 || serverValue === 11 || serverValue === 30;
        console.log(
          `Device: Config ID=${configDevice.id}, Server value=${serverValue}, isOn=${isOn}`
        );

        // Update button state if different from local state
        if (buttonStates[0] !== isOn) {
          buttonStates[0] = isOn;
          updateButtonUI(0, isOn);

          // Mark initial data as loaded on first data reception
          if (!initialDataLoaded) {
            initialDataLoaded = true;
            console.log("Initial data synchronization completed via onValues");
          }
        }
      }
    }
  },

  // Add onDataSync callback to handle periodic data updates
  onDataSync: (values) => {
    console.log("E-Ra data sync received:", values);

    // Process the same way as onValues
    if (values && typeof values === "object" && configDevice) {
      // Get device value using the stored config
      if (values[configDevice.id]) {
        const serverValue = values[configDevice.id].value;
        // Check if value is 10, 11, or 30 for ON state, else OFF
        const isOn =
          serverValue === 10 || serverValue === 11 || serverValue === 30;
        console.log(
          `Data sync - Device: Config ID=${configDevice.id}, Server value=${serverValue}, isOn=${isOn}`
        );

        // Always update if different from local state
        if (buttonStates[0] !== isOn) {
          console.log(
            `Updating device state from ${buttonStates[0]} to ${isOn}`
          );
          buttonStates[0] = isOn;
          updateButtonUI(0, isOn);
        }
      }
    }
  },
});

function updateButtonUI(buttonIndex, isOn) {
  console.log(`updateButtonUI: buttonIndex=${buttonIndex}, isOn=${isOn}`);

  // Update all UI elements
  const statusElement = document.getElementById(`status-${buttonIndex}`);
  const controlButtonElement = document.getElementById(
    `control-button-${buttonIndex}`
  );
  const hiddenButtonElement = document.getElementById(`button-${buttonIndex}`);

  if (isOn) {
    // ON state
    statusElement.classList.add("active");
    statusElement.textContent = "On";
    controlButtonElement.textContent = "Turn ON";
    controlButtonElement.classList.add("active");
    hiddenButtonElement.textContent = "ON";
  } else {
    // OFF state
    statusElement.classList.remove("active");
    statusElement.textContent = "Off";
    controlButtonElement.textContent = "Turn OFF";
    controlButtonElement.classList.remove("active");
    hiddenButtonElement.textContent = "OFF";
  }

  // Update global status variables for backward compatibility
  window[`status${buttonIndex}`] = isOn;
}

function updateButtonState(buttonIndex, isOn) {
  console.log(`updateButtonState: buttonIndex=${buttonIndex}, isOn=${isOn}`);

  // Update local state
  buttonStates[buttonIndex] = isOn;

  // Update UI
  updateButtonUI(buttonIndex, isOn);
}

function toggleButton(buttonIndex) {
  const currentState = buttonStates[buttonIndex];
  const newState = !currentState;

  // Show confirm popup instead of direct action
  showConfirmPopup(buttonIndex, newState);
}

function showConfirmPopup(buttonIndex, isOn) {
  // Store pending action
  pendingAction.buttonIndex = buttonIndex;
  pendingAction.isOn = isOn;

  // Update popup content
  const confirmAction = document.getElementById("confirmAction");
  const confirmDevice = document.getElementById("confirmDevice");
  const confirmButton = document.getElementById("confirmButton");

  // Set action text and styling
  confirmAction.textContent = isOn ? "bật" : "tắt";
  confirmAction.className = isOn ? "confirm-action" : "confirm-action off";

  // Set device name
  confirmDevice.textContent = deviceNames[buttonIndex];

  // Set confirm button styling
  confirmButton.className = isOn
    ? "confirm-btn confirm"
    : "confirm-btn confirm off";
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
  pendingAction.isOn = null;
}

function executeAction() {
  // Execute the pending action
  if (pendingAction.buttonIndex !== null && pendingAction.isOn !== null) {
    controlButton(pendingAction.buttonIndex, pendingAction.isOn);
  }

  // Hide popup
  cancelConfirm();
}

function controlButton(buttonIndex, isOn) {
  console.log(`controlButton called: buttonIndex=${buttonIndex}, isOn=${isOn}`);

  if (!isConfigured) {
    console.warn("Configuration pending - widget not ready");
    // Show container as no-connection
    document.getElementById(`container-0`).classList.add("no-connection");
    return;
  }

  // Check if actions array is available
  if (!actions || actions.length < 2) {
    console.warn("Actions not configured properly");
    // Still update UI locally even if no server action
    updateButtonState(buttonIndex, isOn);
    return;
  }

  // Get action based on ON/OFF state: ON = actions[0], OFF = actions[1] (following the pattern)
  const actionToTrigger = isOn ? actions[0] : actions[1];
  console.log(`Action to trigger:`, actionToTrigger);

  if (actionToTrigger) {
    console.log("Triggering E-Ra action:", actionToTrigger);

    // Use E-Ra standard format with optional chaining (following the pattern)
    eraWidget.triggerAction(actionToTrigger?.action, null);

    // Update UI immediately for better UX
    updateButtonState(buttonIndex, isOn);

    // Request data sync after action to confirm state change
  } else {
    console.warn(`No action config found for ${isOn ? "ON" : "OFF"} state`);
    // Still update UI locally even if no server action
    updateButtonState(buttonIndex, isOn);
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

  // Set initial UI state (will be updated when onValues receives data)
  updateButtonUI(0, false);

  console.log(
    "DOM loaded - waiting for E-Ra configuration and data via onValues..."
  );

  // Add timeout fallback if no data received after configuration
  setTimeout(() => {
    if (isConfigured && !initialDataLoaded) {
      console.warn(
        "No data received via onValues - keeping default OFF states"
      );
      initialDataLoaded = true;
      // Remove no-connection indicator
      document.getElementById(`container-0`).classList.remove("no-connection");
    }
  }, 10000); // 10 second timeout for data reception
});
