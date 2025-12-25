import {Webview} from "@tauri-apps/api/webview";
import {getCurrentWindow, LogicalSize} from "@tauri-apps/api/window";
import {LogicalPosition} from "@tauri-apps/api/dpi";

export interface WebviewPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CreateWebviewOptions {
  label: string;
  url: string;
  position: WebviewPosition;
}

class WebviewManager {
  private webview: Webview | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private checkInterval: number | null = null;

  async createWebview(options: CreateWebviewOptions): Promise<void> {
    try {
      await this.destroyWebview();

      const window = getCurrentWindow();

      this.webview = new Webview(window, options.label, {
        url: options.url,
        x: options.position.x,
        y: options.position.y,
        width: options.position.width,
        height: options.position.height,
      });
      this.webview.once("tauri://webview-created", console.log)

      this.webview.once('tauri://error', function (e) {
        // an error happened creating the webview
        console.error(e)
      });
    } catch (e) {
      console.error('Failed to create webview:', e);
      throw e;
    }
  }

  async updatePosition(position: WebviewPosition): Promise<void> {
    if (!this.webview) return;

    try {
      await this.webview.setPosition(new LogicalPosition({x: position.x, y: position.y}));
      await this.webview.setSize(new LogicalSize({width: position.width, height: position.height}));
    } catch (e) {
      console.error('Failed to update webview position:', e);
    }
  }

  async destroyWebview(): Promise<void> {
    if (this.webview) {
      try {
        await this.webview.close();
      } catch (e) {
        console.error('Failed to destroy webview:', e);
      }
    }
    this.webview = null;
    this.stopObserving();
  }

  startObserving(element: HTMLElement, callback: (position: WebviewPosition) => void): void {
    this.stopObserving();

    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      callback({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    };

    this.resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    this.resizeObserver.observe(element);

    this.mutationObserver = new MutationObserver(() => {
      updatePosition();
    });
    this.mutationObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });

    updatePosition();

    this.checkInterval = window.setInterval(() => {
      updatePosition();
    }, 100);
  }

  stopObserving(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  isWebviewCreated(): boolean {
    return this.webview !== null;
  }
}

export const webviewManager = new WebviewManager();
