// Polyfill only if not natively supported & if DOM is available
if ('HTMLElement' in globalThis && ! ('trustedTypes' in globalThis)) {
	const symbols = {
		key: Symbol('trust:key'),
	};

	const EVENT_ATTRS = new Set(Object.keys(HTMLElement.prototype).filter(key => key.startsWith('on')));

	const getAllowedPolicies = () => {
		const meta = document.head.querySelector('meta[http-equiv="Content-Security-Policy"][content]');

		if (meta instanceof HTMLMetaElement) {
			const directives = meta.content.trim().split(';').filter(str => str.length !== 0).map(dir => dir.trim());

			const csp = Object.fromEntries(directives.map(directive => {
				const [key, ...rest] = directive.trim().split(' ').filter(part => part.length !== 0);
				return [key, rest];
			}));

			const enforced = Array.isArray(csp['require-trusted-types-for']) && csp['require-trusted-types-for'].includes('\'script\'');
			const allowedPolicies = enforced && Array.isArray(csp['trusted-types'])
				? new Set(csp['trusted-types'])
				: new Set();

			const allowDuplicates = allowedPolicies.has('\'allow-duplicates\'');

			if (allowedPolicies.has('\'none\'')) {
				allowedPolicies.clear();
			} else if (allowDuplicates) {
				allowedPolicies.delete('\'allow-duplicates\'');
			}
			return { enforced, allowedPolicies, allowDuplicates };
		} else if (document.documentElement.dataset.hasOwnProperty('trustedPolicies')) {
			const allowedPolicies = new Set(document.documentElement.dataset.trustedPolicies.split(' '));
			const allowDuplicates = allowedPolicies.has('\'allow-duplicates\'');
			const hasNone = allowedPolicies.has('\'none\'');

			if (allowDuplicates) {
				allowedPolicies.delete('\'allow-duplicates\'');
			}

			if (hasNone) {
				allowedPolicies.clear();
			}
			return { enforced: true, allowedPolicies, allowDuplicates };
		} else {
			return { enforced: false, allowedPolicies: new Set(), allowDuplicates: true };
		}
	};

	class TrustedTypePolicyFactory {
		#policies;
		#allowedPolicies;
		#enforced;
		#allowDuplicates;

		constructor({
			enforced,
			allowedPolicies,
			allowDuplicates,
		} = {}, key) {
			if (key !== symbols.key) {
				throw new TypeError('Invalid constructor of TrustedTypePolicyFactory.');
			} else if (! (allowedPolicies instanceof Set)) {
				throw new TypeError('`allowedPolicies` must be a Set.');
			} else {
				this.#allowedPolicies = allowedPolicies;
				this.#enforced = enforced;
				this.#allowDuplicates = allowDuplicates;
				this.#policies = new Map();
			}
		}

		get defaultPolicy() {
			if (this.#policies.has('default')) {
				return this.#policies.get('default');
			} else {
				return null;
			}
		}

		createPolicy(name, {
			createHTML,
			createScript,
			createScriptURL,
		}) {
			if (! /^[-#a-zA-Z0-9=_/@.%]+$/.test(name.toString())) {
				throw new TypeError(`Failed to execute 'createPolicy' on 'TrustedTypePolicyFactory': Policy: "${name}" contains invalid characters.`);
			} else if (this.#enforced && ! this.#allowedPolicies.has(name)) {
				throw new TypeError(`${name} is not an allowed policy.`);
			} else if (! this.#allowDuplicates && this.#policies.has(name)) {
				throw new TypeError(`${name} has already been created and duplicates are not allowed.`);
			} else {
				const policy = new TrustedTypePolicy(name.toString(), {
					createHTML,
					createScript,
					createScriptURL,
				}, symbols.key);

				this.#policies.set(policy.name, policy);

				return policy;
			}
		}

		getAttributeType(tagName, attribute, elementNs/*, attrNs*/) {
			tagName = tagName.toLowerCase();
			attribute = attribute.toLowerCase();

			/**
			 * @Todo handle namespaced attributes
			 */
			if (typeof elementNS === 'string' && elementNs.length !== 0) {
				return EVENT_ATTRS.has(attribute) ? 'TrustedScript' : null;
			}

			/**
			 * This is an `on*` attribute
			 */
			if (EVENT_ATTRS.has(attribute)) {
				return 'TrustedScript';
			}

			switch(tagName) {
				case 'script': {
					if (attribute === 'src') {
						return 'TrustedScriptURL';
					} else {
						return null;
					}
				}

				case 'iframe': {
					if (attribute === 'srcdoc') {
						return 'TrustedHTML';
					} else if (attribute === 'src') {
						return 'TrustedScriptURL';
					} else {
						return null;
					}
				}

				default:
					return null;
			}
		}

		getPropertyType(tagName, property, /*elementNS*/) {
			tagName = tagName.toLowerCase();

			if (EVENT_ATTRS.has(property.toLowerCase())) {
				return 'TrustedScript';
			}

			switch(tagName) {
				case 'embed':
				case 'iframe': {
					if (property === 'src') {
						return 'TrustedScriptURL';
					} else {
						return null;
					}
				}

				case 'script': {
					if (property === 'src') {
						return 'TrustedScriptURL';
					} else if (['text', 'innerText', 'textContent', 'innerHTML'].includes(property)) {
						return 'TrustedScript';
					} else if (['outerHTML'].includes(property)) {
						return 'TrustedHTML';
					} else {
						return null;
					}
				}

				default: {
					if (['innerHTML', 'outerHTML'].includes(property)) {
						return 'TrustedHTML';
					} else {
						return null;
					}
				}
			}
		}

		isHTML(thing) {
			return thing instanceof globalThis.TrustedHTML;
		}

		isScript(thing) {
			return thing instanceof globalThis.TrustedScript;
		}

		isScriptURL(thing) {
			return thing instanceof globalThis.TrustedScriptURL;
		}

		get emptyHTML() {
			return new TrustedHTML('', symbols.key);
		}

		get emptyScript() {
			return new TrustedScript('', symbols.key);
		}

		get [Symbol.for('polyfilled')]() {
			return true;
		}

		get [Symbol.for('enforced')]() {
			return this.#enforced;
		}
	}

	class TrustedTypePolicy {
		#name;
		#createHTML;
		#createScript;
		#createScriptURL;
		#policies;

		constructor(name, {
			createHTML,
			createScript,
			createScriptURL,
		}, key) {
			if (key !== symbols.key) {
				throw new Error(`Invalid construction of ${name} policy.`);
			} else {
				this.#name = name;
				this.#createHTML = createHTML;
				this.#createScript = createScript;
				this.#createScriptURL = createScriptURL;
			}
		}

		get name() {
			return this.#name;
		}

		createHTML(input, ...args) {
			if (this.#createHTML instanceof Function) {
				return new TrustedHTML(this.#createHTML(input.toString(), ...args).toString(), symbols.key);
			} else {
				throw new TypeError('This policy does not provide `createHTML()`');
			}
		}

		createScript(input, ...args) {
			if (this.#createScript instanceof Function) {
				return new TrustedScript(this.#createScript(input.toString(), ...args).toString(), symbols.key);
			} else {
				throw new TypeError('This policy does not provide `createScript()`');
			}
		}

		createScriptURL(input, ...args) {
			if (this.#createScriptURL instanceof Function) {
				return new TrustedScriptURL(this.#createScriptURL(input.toString(), ...args).toString(), symbols.key);
			} else {
				throw new TypeError('This policy does not provide `createScriptURL()`');
			}
		}
	}

	class TrustedType {
		#value;

		constructor(value, key) {
			if (key !== symbols.key) {
				throw new Error('Invalid constructor of TrustedType.');
			} else {
				this.#value = value;
			}
		}

		toString() {
			return this.#value;
		}

		toJSON() {
			return this.#value;
		}
	}

	class TrustedHTML extends TrustedType {}

	class TrustedScript extends TrustedType {}

	class TrustedScriptURL extends TrustedType {}

	globalThis.TrustedTypePolicyFactory = TrustedTypePolicyFactory;
	globalThis.trustedTypes = new TrustedTypePolicyFactory(getAllowedPolicies(), symbols.key);
	globalThis.TrustedHTML = TrustedHTML;
	globalThis.TrustedScript = TrustedScript;
	globalThis.TrustedScriptURL = TrustedScriptURL;
}
