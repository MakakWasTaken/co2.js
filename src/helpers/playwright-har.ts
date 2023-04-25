// import { Page, Frame, CDPSession } from "playwright";
// // @ts-ignore
// import { harFromMessages } from "chrome-har";

// // event types to observe
// const page_observe = [
//   "Page.loadEventFired",
//   "Page.domContentEventFired",
//   "Page.frameStartedLoading",
//   "Page.frameAttached",
//   "Page.frameScheduledNavigation",
// ];

// const network_observe = [
//   "Network.requestWillBeSent",
//   "Network.requestServedFromCache",
//   "Network.dataReceived",
//   "Network.responseReceived",
//   "Network.resourceChangedPriority",
//   "Network.loadingFinished",
//   "Network.loadingFailed",
// ];

// class PuppeteerHar {
//   inProgress: boolean;
//   page: Page;
//   mainFrame: Frame;
//   captureMimeTypes: string[] = [];
//   client?: CDPSession;
//   page_events: { method: string; params: any }[] = [];
//   network_events: { method: string; params: any }[] = [];
//   response_body_promises: Promise<any>[] = [];

//   /**
//    * @param {object} page
//    */
//   constructor(page: Page) {
//     this.page = page;
//     this.mainFrame = this.page.mainFrame();
//     this.inProgress = false;
//     this.cleanUp();
//   }

//   /**
//    * @returns {void}
//    */
//   cleanUp() {
//     this.network_events = [];
//     this.page_events = [];
//     this.response_body_promises = [];
//   }

//   /**
//    * @param {{path: string}=} options
//    * @return {Promise<void>}
//    */
//   async start({
//     captureMimeTypes,
//   }: {
//     captureMimeTypes?: string[];
//   } = {}) {
//     this.inProgress = true;
//     this.captureMimeTypes = captureMimeTypes || [
//       "text/html",
//       "application/json",
//     ];
//     this.client = await this.page.target().createCDPSession();
//     if (this.client) {
//       await this.client.send("Page.enable");
//       await this.client.send("Network.enable");
//       page_observe.forEach((method) => {
//         this.client?.on(method, (params) => {
//           if (!this.inProgress) {
//             return;
//           }
//           this.page_events.push({ method, params });
//         });
//       });
//       network_observe.forEach((method) => {
//         this.client?.on("Network.responseReceived", (params) => {
//           if (!this.inProgress) {
//             return;
//           }
//           this.network_events.push({ method, params });

//           const response = params.response;
//           const requestId = params.requestId;

//           // Response body is unavailable for redirects, no-content, image, audio and video responses
//           if (
//             response.status !== 204 &&
//             response.headers.location == null &&
//             this.captureMimeTypes.includes(response.mimeType)
//           ) {
//             const promise = this.client
//               ?.send("Network.getResponseBody", { requestId })
//               .then(
//                 (responseBody) => {
//                   // Set the response so `chrome-har` can add it to the HAR
//                   params.response..body = Buffer.from(
//                     responseBody.body,
//                     responseBody.base64Encoded ? "base64" : undefined
//                   ).toString();
//                 },
//                 (reason) => {
//                   // Resources (i.e. response bodies) are flushed after page commits
//                   // navigation and we are no longer able to retrieve them. In this
//                   // case, fail soft so we still add the rest of the response to the
//                   // HAR. Possible option would be force wait before navigation...
//                 }
//               );
//             if (promise) {
//               this.response_body_promises.push(promise);
//             }
//           }
//         });
//       });
//     }
//   }

//   /**
//    * @returns {Promise<void|object>}
//    */
//   async stop() {
//     this.inProgress = false;
//     await Promise.all(this.response_body_promises);
//     await this.client?.detach();
//     const har = harFromMessages(this.page_events.concat(this.network_events), {
//       includeTextFromResponseBody: true,
//     });
//     this.cleanUp();
//     return har;
//   }
// }

// export default PuppeteerHar;
