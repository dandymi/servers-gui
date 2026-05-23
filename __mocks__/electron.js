const { EventEmitter } = require('events');

const mockBrowserWindow = class extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.webContents = new EventEmitter();
    this.destroyed = false;
  }
  loadFile() {}
  destroy() {
    this.destroyed = true;
    this.emit('close');
  }
  isDestroyed() {
    return this.destroyed;
  }
  setTitle() {}
  focus() {}
  show() {}
  hide() {}
  setMenu() {}
  setSize() {}
  setResizable() {}
  setMaximizable() {}
  setMinimizable() {}
  setFullScreen() {}
  isFullScreen() {}
  setAspectRatio() {}
  setBackgroundColor() {}
  flashFrame() {}
  setIcon() {}
  setThumbarButtons() {}
  setProgressBar() {}
  setOverlayIcon() {}
  setHasShadow() {}
  setOpacity() {}
  setVisibleOnAllWorkspaces() {}
  setFullScreenable() {}
  setSimpleFullScreen() {}
  isModal() {}
  setAlwaysOnTop() {}
  moveTop() {}
  center() {}
  setPosition() {}
  getPosition() {}
  setBounds() {}
  getBounds() {}
  setContentBounds() {}
  getContentBounds() {}
  setMinimumSize() {}
  getMinimumSize() {}
  setMaximumSize() {}
  getMaximumSize() {}
  setResizable() {}
  isResizable() {}
  setMovable() {}
  isMovable() {}
  setMinimizable() {}
  isMinimizable() {}
  setMaximizable() {}
  isMaximizable() {}
  setFullScreenable() {}
  isFullScreenable() {}
  setClosable() {}
  isClosable() {}
  setHasShadow() {}
  hasShadow() {}
  setOpacity() {}
  getOpacity() {}
  setVisibleOnAllWorkspaces() {}
  isVisibleOnAllWorkspaces() {}
  setIgnoreMouseEvents() {}
  setAlwaysOnTop() {}
  isAlwaysOnTop() {}
  moveAbove() {}
  moveBelow() {}
  setAutoHideMenuBar() {}
  isMenuBarAutoHide() {}
  setMenuBarVisibility() {}
  isMenuBarVisible() {}
  setVisibleOnAllWorkspaces() {}
  isVisibleOnAllWorkspaces() {}
  setTitleBarOverlay() {}
  getTitleBarOverlay() {}
  setTitleBarOverlay() {}
  getTitleBarOverlay() {}
  setTitleBarOverlay() {}
  getTitleBarOverlay() {}
  setTitleBarOverlay() {}
  getTitleBarOverlay() {}
};

const mockApp = {
  whenReady: () => Promise.resolve(),
  quit: () => {},
  exit: () => {},
  getVersion: () => '1.0.0',
  getName: () => 'Test App',
  setName: () => {},
  getLocale: () => {},
  setLocale: () => {},
  getLocaleOptions: () => {},
  setBadgeCount: () => {},
  getBadgeCount: () => {},
  isUnityRunning: () => {},
  getLoginItemSettings: () => {},
  setLoginItemSettings: () => {},
  isAccessibilitySupportEnabled: () => {},
  setAccessibilitySupportEnabled: () => {},
  showAboutPanel: () => {},
  setAboutPanelOptions: () => {},
  isInApplicationsFolder: () => {},
  setAsDefaultProtocolClient: () => {},
  removeAsDefaultProtocolClient: () => {},
  getDefaultProtocolClient: () => {},
  getAppMetrics: () => {},
  getAppPaths: () => {},
  getPath: () => {},
  getPaths: () => {},
  queryAppIdentifier: () => {},
  queryAppVendor: () => {},
  queryAppVersion: () => {},
  getApplicationNameForMenu: () => {},
  getApplicationNameForMenu: () => {},
  getGPUFeatureStatus: () => {},
  getGPUInfo: () => {},
  setUserTasks: () => {},
  getUserTasks: () => {},
  commandLine: {
    appendSwitch: () => {},
    appendArgument: () => {},
  },
  dock: {
    setBadge: () => {},
    getBadge: () => {},
    hide: () => {},
    show: () => {},
    isVisible: () => {},
    setMenu: () => {},
    bounce: () => {},
    downloadFinished: () => {},
    setIcon: () => {},
  },
  menu: {
    setApplicationMenu: () => {},
    getApplicationMenu: () => {},
    buildFromTemplate: () => {},
    buildFromTemplate: () => {},
  },
  powerMonitor: {
    on: () => {},
    removeListener: () => {},
  },
  powerSaveBlocker: {
    start: () => {},
    stop: () => {},
    isStarted: () => {},
  },
  session: {
    fromPartition: () => ({
      clearStorageData: () => Promise.resolve(),
      clearCache: () => Promise.resolve(),
      flushStorageData: () => Promise.resolve(),
      setPermissionRequestHandler: () => {},
      setPermissionChecker: () => {},
      setDownloadPath: () => {},
      getDownloadPath: () => {},
      setUserAgent: () => {},
      getUserAgent: () => {},
      setPreloads: () => {},
      getPreloads: () => {},
      setSecurityInterceptor: () => {},
      setCertificateVerifyProc: () => {},
      clearAuthCache: () => {},
    }),
  },
  // IPC Main
  ipcMain: {
    on: () => {},
    once: () => {},
    removeListener: () => {},
    removeAllListeners: () => {},
    handle: () => {},
    handleOnce: () => {},
    invoke: () => {},
    removeHandler: () => {},
  },
  // IPC Renderer (in preload)
  ipcRenderer: {
    send: () => {},
    sendSync: () => {},
    invoke: () => {},
    on: () => {},
    once: () => {},
    removeListener: () => {},
    removeAllListeners: () => {},
    sendTo: () => {},
    sendToHost: () => {},
  },
};

module.exports = {
  app: mockApp,
  BrowserWindow: mockBrowserWindow,
  ipcMain: mockApp.ipcMain,
  ipcRenderer: mockApp.ipcRenderer,
  // Add other commonly used Electron modules as needed
  screen: {
    getPrimaryDisplay: () => ({
      bounds: { x: 0, y: 0, width: 800, height: 600 },
      workArea: { x: 0, y: 0, width: 800, height: 600 },
      scaleFactor: 1,
      rotation: 0,
      touchSupport: 'available',
      colorDepth: 24,
      depthPerComponent: 8,
      monochrome: false,
    }),
    getAllDisplays: () => [
      {
        id: 1,
        bounds: { x: 0, y: 0, width: 800, height: 600 },
        workArea: { x: 0, y: 0, width: 800, height: 600 },
        scaleFactor: 1,
        rotation: 0,
        touchSupport: 'available',
        colorDepth: 24,
        depthPerComponent: 8,
        monochrome: false,
      },
    ],
    getDisplayNearestPoint: () => ({
      id: 1,
      bounds: { x: 0, y: 0, width: 800, height: 600 },
      workArea: { x: 0, y: 0, width: 800, height: 600 },
      scaleFactor: 1,
      rotation: 0,
      touchSupport: 'available',
      colorDepth: 24,
      depthPerComponent: 8,
      monochrome: false,
    }),
    getDisplayMatching: () => ({
      id: 1,
      bounds: { x: 0, y: 0, width: 800, height: 600 },
      workArea: { x: 0, y: 0, width: 800, height: 600 },
      scaleFactor: 1,
      rotation: 0,
      touchSupport: 'available',
      colorDepth: 24,
      depthPerComponent: 8,
      monochrome: false,
    }),
  },
  // Mock the Tray module if needed
  Tray: class extends EventEmitter {
    constructor() {
      super();
    }
    setImage() {}
    setPressedImage() {}
    setToolTip() {}
    getToolTip() {}
    setTitle() {}
    getTitle() {}
    setContextMenu() {}
    getContextMenu() {}
    setIgnoreDoubleClickEvents() {}
    getIgnoreDoubleClickEvents() {}
    setHighlightMode() {}
    getHighlightMode() {}
    display() {}
    destroy() {
      this.emit('destroy');
    }
    isDestroyed() {
      return false;
    }
    toggleVisibility() {}
    popUpContextMenu() {}
    getBounds() {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    setBounds() {}
    getBounds() {}
  },
};
