/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/AuthCheck.js":
/*!*********************************!*\
  !*** ./components/AuthCheck.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst AuthCheck = ({ children })=>{\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"AuthCheck.useEffect\": ()=>{\n            const checkAuth = {\n                \"AuthCheck.useEffect.checkAuth\": async ()=>{\n                    try {\n                        const response = await fetch('/api/auth/validate');\n                        if (!response.ok && router.pathname !== '/login') {\n                            router.push('/login');\n                        }\n                    } catch (error) {\n                        if (router.pathname !== '/login') {\n                            router.push('/login');\n                        }\n                    } finally{\n                        setLoading(false);\n                    }\n                }\n            }[\"AuthCheck.useEffect.checkAuth\"];\n            checkAuth();\n        }\n    }[\"AuthCheck.useEffect\"], [\n        router\n    ]);\n    if (loading) {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            children: \"Loading...\"\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Angelo\\\\Documents\\\\_projects\\\\New folder\\\\stream-viewer-ai\\\\components\\\\AuthCheck.js\",\n            lineNumber: 28,\n            columnNumber: 12\n        }, undefined); // Add a proper loading spinner here\n    }\n    return children;\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AuthCheck);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0F1dGhDaGVjay5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUE0QztBQUNKO0FBRXhDLE1BQU1HLFlBQVksQ0FBQyxFQUFFQyxRQUFRLEVBQUU7SUFDN0IsTUFBTUMsU0FBU0gsc0RBQVNBO0lBQ3hCLE1BQU0sQ0FBQ0ksU0FBU0MsV0FBVyxHQUFHTiwrQ0FBUUEsQ0FBQztJQUV2Q0QsZ0RBQVNBOytCQUFDO1lBQ1IsTUFBTVE7aURBQVk7b0JBQ2hCLElBQUk7d0JBQ0YsTUFBTUMsV0FBVyxNQUFNQyxNQUFNO3dCQUM3QixJQUFJLENBQUNELFNBQVNFLEVBQUUsSUFBSU4sT0FBT08sUUFBUSxLQUFLLFVBQVU7NEJBQ2hEUCxPQUFPUSxJQUFJLENBQUM7d0JBQ2Q7b0JBQ0YsRUFBRSxPQUFPQyxPQUFPO3dCQUNkLElBQUlULE9BQU9PLFFBQVEsS0FBSyxVQUFVOzRCQUNoQ1AsT0FBT1EsSUFBSSxDQUFDO3dCQUNkO29CQUNGLFNBQVU7d0JBQ1JOLFdBQVc7b0JBQ2I7Z0JBQ0Y7O1lBRUFDO1FBQ0Y7OEJBQUc7UUFBQ0g7S0FBTztJQUVYLElBQUlDLFNBQVM7UUFDWCxxQkFBTyw4REFBQ1M7c0JBQUk7Ozs7O3VCQUFrQixvQ0FBb0M7SUFDcEU7SUFFQSxPQUFPWDtBQUNUO0FBRUEsaUVBQWVELFNBQVNBLEVBQUMiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQW5nZWxvXFxEb2N1bWVudHNcXF9wcm9qZWN0c1xcTmV3IGZvbGRlclxcc3RyZWFtLXZpZXdlci1haVxcY29tcG9uZW50c1xcQXV0aENoZWNrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IHVzZVJvdXRlciB9IGZyb20gJ25leHQvcm91dGVyJztcclxuXHJcbmNvbnN0IEF1dGhDaGVjayA9ICh7IGNoaWxkcmVuIH0pID0+IHtcclxuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGNoZWNrQXV0aCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKCcvYXBpL2F1dGgvdmFsaWRhdGUnKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rICYmIHJvdXRlci5wYXRobmFtZSAhPT0gJy9sb2dpbicpIHtcclxuICAgICAgICAgIHJvdXRlci5wdXNoKCcvbG9naW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgaWYgKHJvdXRlci5wYXRobmFtZSAhPT0gJy9sb2dpbicpIHtcclxuICAgICAgICAgIHJvdXRlci5wdXNoKCcvbG9naW4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY2hlY2tBdXRoKCk7XHJcbiAgfSwgW3JvdXRlcl0pO1xyXG5cclxuICBpZiAobG9hZGluZykge1xyXG4gICAgcmV0dXJuIDxkaXY+TG9hZGluZy4uLjwvZGl2PjsgLy8gQWRkIGEgcHJvcGVyIGxvYWRpbmcgc3Bpbm5lciBoZXJlXHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2hpbGRyZW47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBdXRoQ2hlY2s7ICJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInVzZVJvdXRlciIsIkF1dGhDaGVjayIsImNoaWxkcmVuIiwicm91dGVyIiwibG9hZGluZyIsInNldExvYWRpbmciLCJjaGVja0F1dGgiLCJyZXNwb25zZSIsImZldGNoIiwib2siLCJwYXRobmFtZSIsInB1c2giLCJlcnJvciIsImRpdiJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/AuthCheck.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_Home_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/Home.css */ \"./styles/Home.css\");\n/* harmony import */ var _styles_Home_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_Home_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_AuthCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/AuthCheck */ \"./components/AuthCheck.js\");\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_AuthCheck__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\Angelo\\\\Documents\\\\_projects\\\\New folder\\\\stream-viewer-ai\\\\pages\\\\_app.js\",\n            lineNumber: 7,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\Angelo\\\\Documents\\\\_projects\\\\New folder\\\\stream-viewer-ai\\\\pages\\\\_app.js\",\n        lineNumber: 6,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBMkI7QUFDb0I7QUFFL0MsU0FBU0MsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRTtJQUNyQyxxQkFDRSw4REFBQ0gsNkRBQVNBO2tCQUNSLDRFQUFDRTtZQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7O0FBRzlCO0FBRUEsaUVBQWVGLEtBQUtBLEVBQUEiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcQW5nZWxvXFxEb2N1bWVudHNcXF9wcm9qZWN0c1xcTmV3IGZvbGRlclxcc3RyZWFtLXZpZXdlci1haVxccGFnZXNcXF9hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICcuLi9zdHlsZXMvSG9tZS5jc3MnXHJcbmltcG9ydCBBdXRoQ2hlY2sgZnJvbSAnLi4vY29tcG9uZW50cy9BdXRoQ2hlY2snXHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcclxuICByZXR1cm4gKFxyXG4gICAgPEF1dGhDaGVjaz5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgPC9BdXRoQ2hlY2s+XHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeUFwcCAiXSwibmFtZXMiOlsiQXV0aENoZWNrIiwiTXlBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/Home.css":
/*!*************************!*\
  !*** ./styles/Home.css ***!
  \*************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();