import { Component, ReactNode, createRef } from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";

type ContractWebViewProps = {
  uri: string;
}

class ContractWebView extends Component<ContractWebViewProps> {
  private readonly runFirst: string = `
    (() => {
      oldConsoleLog = console.log.bind(console);
      oldConsoleError = console.error.bind(console);
      window.isNativeApp = true;
      ['debug', 'log','error', 'info', 'warn'].forEach(k => {
        if (typeof console[k] === 'function') {
          const kb = console[k].bind(console);
          console[k] = (...args) => {
            kb(...args);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'console', args: [k, ...args] }));
          }
        }
      });
      if (typeof window.handleCommand === 'undefined') {
        window.handleCommand = (cmd) => {
          oldConsoleError('[NATIVE] window.handleCommand not defined');
          return cmd;
        }
      }
      window._handleCommand = async (id, cmd) => {
        try {
          cmd = JSON.parse(cmd);
        } catch (error) {
          oldConsoleError('[NATIVE] RECEIVED INVALID JSON: ' + cmd);
        }
        oldConsoleLog('[NATIVE] RECEIVED COMMAND: ', cmd);
        try {
          const response = await window.handleCommand(cmd);
          oldConsoleLog('[NATIVE] RESPONSE: ', response);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type:'response', id, response }));
        } catch (error) {
          oldConsoleError('[NATIVE] Error handling command: ', error);
          let e = JSON.stringify(error);
          e.stack = error.stack.toString();
          window.ReactNativeWebView.postMessage(JSON.stringify({ type:'response', id, error: e }));
        }
      };
    })();
    true;
  `;
  private webViewRef: any;
  private resolveMap: Map<string, any>;

  constructor(props: ContractWebViewProps) {
    super(props);
    this.webViewRef = createRef();
    this.resolveMap = new Map();
  }

  public sendCommandToWebApp = (commandObject: object): Promise<any> => {
    if (!this.webViewRef.current) {
      console.error("WebView is not mounted");
      return Promise.resolve(null);
    }
    let resolvePromise, rejectPromise, id = Date.now() + '' + Math.round(Math.random() * 1000000);
    const promise = new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
    this.webViewRef.current.injectJavaScript(`
      window._handleCommand("${id}", ${JSON.stringify(commandObject)});
      true;
    `);
    this.resolveMap.set(id, { resolve: resolvePromise, reject: rejectPromise });
    return promise;
  }

  private handleMessage = (event: WebViewMessageEvent) => {
    const rawData = event.nativeEvent.data;
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.log(`[WEBWIEW] RECEIVED INVALID JSON: ${rawData}`);
    }
    switch (data.type) {
      case 'console':
        console.log(`[WEVIEW console.${data.args[0]}]`, ...data.args.slice(1));
        return;
      case 'response':
        if (this.resolveMap.has(data.id)) {
          console.log(`[WEBVIEW] RECEIVED RESPONSE FOR ID ${data.id}`);
          const { resolve, reject } = this.resolveMap.get(data.id);
          if (data.error) {
            let e = new Error(data.error);
            Object.entries(data.error).forEach(([k, v]) => {
              // @ts-ignore
              e[k] = v;
            });
            reject(e);
          } else {
            resolve(data.response);
          }
          this.resolveMap.delete(data.id);
        } else {
          console.error(`[WEBVIEW] RECEIVED RESPONSE FOR ID ${data.id} BUT NO PENDING PROMISE`);
        }
        return;
      default:
        console.log(`[WEBVIEW] UNHANDLED MESSAGE: ${rawData}`);
        return;
    }
  }

  render(): ReactNode {
    return (
      <WebView
        ref={this.webViewRef}
        source={{ uri: this.props.uri }}
        injectedJavaScriptBeforeContentLoaded={this.runFirst}
        onMessage={this.handleMessage}
        style={{ width: 200, height: 50 }}
      />
    );
  }
}

export default ContractWebView;