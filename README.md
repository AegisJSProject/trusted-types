# @aegisjsproject/trusted-types

A polyfill for the [Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)

[![CodeQL](https://github.com/AegisJSProject/trusted-types/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/trusted-types/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/trusted-types/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/trusted-types/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/trusted-types.svg)](https://github.com/AegisJSProject/trusted-types/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/trusted-types.svg)](https://github.com/AegisJSProject/trusted-types/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/trusted-types?logo=github)](https://github.com/AegisJSProject/trusted-types/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/trusted-types)](https://www.npmjs.com/package/@aegisjsproject/trusted-types)
![node-current](https://img.shields.io/node/v/@aegisjsproject/trusted-types)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@aegisjsproject/trusted-types)
[![npm](https://img.shields.io/npm/dw/@aegisjsproject/trusted-types?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/trusted-types)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProoject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/trusted-types.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/trusted-types.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->

## [Concepts and Usage](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API#concepts_and_usage)

Client-side, or DOM-based, XSS attacks happen when data controlled by a user
(such as that input into a form field) reaches a function that can execute that
data. These functions are known as injection sinks. DOM-based XSS attacks happen
when a user is able to write arbitrary JavaScript code and have it executed by one
of these functions.

The Trusted Types API locks down risky injection sinks, requiring you to process
the data before passing it to one of these functions. If you use a string, then
the browser will throw a TypeError and prevent the use of the function.

Trusted Types works alongside [Content-Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
with the [`trusted-types`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/trusted-types)
and [`require-trusted-types-for`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for)
directives.

### [Injection Sinks](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API#injection_sinks)

The Trusted Types API locks down injection sinks that can act as a vector for DOM-XSS
attacks. An injection sink is any Web API function that should only be called
with trusted, validated or sanitized input. Examples of injection sinks include:

- Functions that insert HTML into the document such as Element.innerHTML, Element.outerHTML, or Document.write.
- Functions that create a new same-origin Document with caller-controlled markup such as DOMParser.parseFromString.
- Functions that execute code such as Global_Objects/eval.
- Setters for Element attributes that accept a URL of code to load or execute.

Trusted Types will force you to process the data before passing it to any
injection sink rather than use a string. This ensures that the data is trustworthy.

> [!IMPORTANT]
> Since the document cannot directly access HTTP headers, this polyfill requires
> either `<meta http-equiv="Content-Security-Policy">` or a `data-trusted-policies`
> attribute to be set on `<html>`.

The Trusted Types API gives web developers a way to lock down the insecure parts
of the DOM API to prevent client-side Cross-site scripting (XSS) attacks.

## Included Scripts/Modules
- **`trusted-types`**: Polyfills the `globalThis.trustedTypes`  object
- **`harden`**: Overwrites "injection sink" property & attribute setters
- **`bundle`**: Loads polyfill and conditionally "harden"s
