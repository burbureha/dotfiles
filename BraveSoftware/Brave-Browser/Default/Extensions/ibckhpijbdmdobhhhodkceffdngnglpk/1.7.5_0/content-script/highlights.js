(function () {
    'use strict';

    // use same api for chromium and firefox
    const browserObj = typeof browser !== "undefined" ? browser : chrome;
    browserObj.action = chrome.action || browserObj.browserAction;

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function getBrowser() {
        // @ts-ignore
        return typeof browser !== "undefined" ? browser : chrome;
    }
    function getBrowserType() {
        // @ts-ignore
        if (typeof browser !== "undefined") {
            return "firefox";
        }
        else {
            return "chromium";
        }
    }
    function getUnclutterExtensionId() {
        return getBrowserType() === "chromium"
            ? "ibckhpijbdmdobhhhodkceffdngnglpk"
            : "{8f8c4c52-216c-4c6f-aae0-c214a870d9d9}";
    }
    function getNewTabExtensionId() {
        return getBrowserType() === "chromium"
            ? "bghgkooimeljolohebojceacblokenjn"
            : "{bb10288b-838a-4429-be0a-5268ee1560b8}";
    }
    // send a message to the Unclutter or Unclutter library extension
    function sendMessage(message, toLibrary = false) {
        return new Promise((resolve, reject) => {
            try {
                // preferrable send message to extension directly (https://developer.chrome.com/docs/extensions/mv3/messaging/#external-webpage)
                // this is the only way to send data from extension to extension
                getBrowser().runtime.sendMessage(toLibrary ? getNewTabExtensionId() : getUnclutterExtensionId(), message, resolve);
            }
            catch (err) {
                if (toLibrary) {
                    return;
                }
                // proxy with boot.js content script, e.g. for Firefox (see listenForPageEvents())
                const messageId = Math.random().toString(36).slice(2);
                const listener = (event) => {
                    if (event.data.event === "proxyUnclutterMessageResponse" &&
                        event.data.messageId === messageId) {
                        resolve(event.data.response);
                        window.removeEventListener("message", listener);
                    }
                };
                window.addEventListener("message", listener);
                window.postMessage({
                    event: "proxyUnclutterMessage",
                    messageId,
                    message,
                }, "*");
                // pre 1.7.1 fallback, does not support responses
                window.postMessage(message, "*");
            }
        });
    }

    function reportEventContentScript(name, data = {}) {
        sendMessage({
            event: "reportEvent",
            name,
            data,
        });
    }

    // wrap class
    const trackedMethods = new Set([
        "prepare",
        "transitionIn",
        "prepareAnimation",
        "executeAnimation",
        "afterTransitionIn",
        "beforeTransitionOut",
        "executeReverseAnimation",
        "transitionOut",
        "afterTransitionOut",
    ]);
    // TODO catch async errors?
    function trackModifierExecution(target) {
        target.name;
        const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
        for (const [propName, descriptor] of Object.entries(descriptors)) {
            const isMethod = typeof descriptor.value == "function" && propName != "constructor";
            if (!isMethod)
                continue;
            if (!trackedMethods.has(propName))
                continue;
            const originalMethod = descriptor.value;
            descriptor.value = function (...args) {
                try {
                    return originalMethod.apply(this, args);
                }
                catch (error) {
                    console.error(error);
                    return undefined;
                }
            };
            Object.defineProperty(target.prototype, propName, descriptor);
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire (path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var sha256$1 = {exports: {}};

    var core = {exports: {}};

    (function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory();
    	}
    }(commonjsGlobal, function () {

    	/*globals window, global, require*/

    	/**
    	 * CryptoJS core components.
    	 */
    	var CryptoJS = CryptoJS || (function (Math, undefined$1) {

    	    var crypto;

    	    // Native crypto from window (Browser)
    	    if (typeof window !== 'undefined' && window.crypto) {
    	        crypto = window.crypto;
    	    }

    	    // Native crypto in web worker (Browser)
    	    if (typeof self !== 'undefined' && self.crypto) {
    	        crypto = self.crypto;
    	    }

    	    // Native crypto from worker
    	    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    	        crypto = globalThis.crypto;
    	    }

    	    // Native (experimental IE 11) crypto from window (Browser)
    	    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
    	        crypto = window.msCrypto;
    	    }

    	    // Native crypto from global (NodeJS)
    	    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
    	        crypto = commonjsGlobal.crypto;
    	    }

    	    // Native crypto import via require (NodeJS)
    	    if (!crypto && typeof commonjsRequire === 'function') {
    	        try {
    	            crypto = require('crypto');
    	        } catch (err) {}
    	    }

    	    /*
    	     * Cryptographically secure pseudorandom number generator
    	     *
    	     * As Math.random() is cryptographically not safe to use
    	     */
    	    var cryptoSecureRandomInt = function () {
    	        if (crypto) {
    	            // Use getRandomValues method (Browser)
    	            if (typeof crypto.getRandomValues === 'function') {
    	                try {
    	                    return crypto.getRandomValues(new Uint32Array(1))[0];
    	                } catch (err) {}
    	            }

    	            // Use randomBytes method (NodeJS)
    	            if (typeof crypto.randomBytes === 'function') {
    	                try {
    	                    return crypto.randomBytes(4).readInt32LE();
    	                } catch (err) {}
    	            }
    	        }

    	        throw new Error('Native crypto module could not be used to get secure random number.');
    	    };

    	    /*
    	     * Local polyfill of Object.create

    	     */
    	    var create = Object.create || (function () {
    	        function F() {}

    	        return function (obj) {
    	            var subtype;

    	            F.prototype = obj;

    	            subtype = new F();

    	            F.prototype = null;

    	            return subtype;
    	        };
    	    }());

    	    /**
    	     * CryptoJS namespace.
    	     */
    	    var C = {};

    	    /**
    	     * Library namespace.
    	     */
    	    var C_lib = C.lib = {};

    	    /**
    	     * Base object for prototypal inheritance.
    	     */
    	    var Base = C_lib.Base = (function () {


    	        return {
    	            /**
    	             * Creates a new object that inherits from this object.
    	             *
    	             * @param {Object} overrides Properties to copy into the new object.
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         field: 'value',
    	             *
    	             *         method: function () {
    	             *         }
    	             *     });
    	             */
    	            extend: function (overrides) {
    	                // Spawn
    	                var subtype = create(this);

    	                // Augment
    	                if (overrides) {
    	                    subtype.mixIn(overrides);
    	                }

    	                // Create default initializer
    	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    	                    subtype.init = function () {
    	                        subtype.$super.init.apply(this, arguments);
    	                    };
    	                }

    	                // Initializer's prototype is the subtype object
    	                subtype.init.prototype = subtype;

    	                // Reference supertype
    	                subtype.$super = this;

    	                return subtype;
    	            },

    	            /**
    	             * Extends this object and runs the init method.
    	             * Arguments to create() will be passed to init().
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var instance = MyType.create();
    	             */
    	            create: function () {
    	                var instance = this.extend();
    	                instance.init.apply(instance, arguments);

    	                return instance;
    	            },

    	            /**
    	             * Initializes a newly created object.
    	             * Override this method to add some logic when your objects are created.
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         init: function () {
    	             *             // ...
    	             *         }
    	             *     });
    	             */
    	            init: function () {
    	            },

    	            /**
    	             * Copies properties into this object.
    	             *
    	             * @param {Object} properties The properties to mix in.
    	             *
    	             * @example
    	             *
    	             *     MyType.mixIn({
    	             *         field: 'value'
    	             *     });
    	             */
    	            mixIn: function (properties) {
    	                for (var propertyName in properties) {
    	                    if (properties.hasOwnProperty(propertyName)) {
    	                        this[propertyName] = properties[propertyName];
    	                    }
    	                }

    	                // IE won't copy toString using the loop above
    	                if (properties.hasOwnProperty('toString')) {
    	                    this.toString = properties.toString;
    	                }
    	            },

    	            /**
    	             * Creates a copy of this object.
    	             *
    	             * @return {Object} The clone.
    	             *
    	             * @example
    	             *
    	             *     var clone = instance.clone();
    	             */
    	            clone: function () {
    	                return this.init.prototype.extend(this);
    	            }
    	        };
    	    }());

    	    /**
    	     * An array of 32-bit words.
    	     *
    	     * @property {Array} words The array of 32-bit words.
    	     * @property {number} sigBytes The number of significant bytes in this word array.
    	     */
    	    var WordArray = C_lib.WordArray = Base.extend({
    	        /**
    	         * Initializes a newly created word array.
    	         *
    	         * @param {Array} words (Optional) An array of 32-bit words.
    	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.create();
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    	         */
    	        init: function (words, sigBytes) {
    	            words = this.words = words || [];

    	            if (sigBytes != undefined$1) {
    	                this.sigBytes = sigBytes;
    	            } else {
    	                this.sigBytes = words.length * 4;
    	            }
    	        },

    	        /**
    	         * Converts this word array to a string.
    	         *
    	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    	         *
    	         * @return {string} The stringified word array.
    	         *
    	         * @example
    	         *
    	         *     var string = wordArray + '';
    	         *     var string = wordArray.toString();
    	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    	         */
    	        toString: function (encoder) {
    	            return (encoder || Hex).stringify(this);
    	        },

    	        /**
    	         * Concatenates a word array to this word array.
    	         *
    	         * @param {WordArray} wordArray The word array to append.
    	         *
    	         * @return {WordArray} This word array.
    	         *
    	         * @example
    	         *
    	         *     wordArray1.concat(wordArray2);
    	         */
    	        concat: function (wordArray) {
    	            // Shortcuts
    	            var thisWords = this.words;
    	            var thatWords = wordArray.words;
    	            var thisSigBytes = this.sigBytes;
    	            var thatSigBytes = wordArray.sigBytes;

    	            // Clamp excess bits
    	            this.clamp();

    	            // Concat
    	            if (thisSigBytes % 4) {
    	                // Copy one byte at a time
    	                for (var i = 0; i < thatSigBytes; i++) {
    	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    	                }
    	            } else {
    	                // Copy one word at a time
    	                for (var j = 0; j < thatSigBytes; j += 4) {
    	                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
    	                }
    	            }
    	            this.sigBytes += thatSigBytes;

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Removes insignificant bits.
    	         *
    	         * @example
    	         *
    	         *     wordArray.clamp();
    	         */
    	        clamp: function () {
    	            // Shortcuts
    	            var words = this.words;
    	            var sigBytes = this.sigBytes;

    	            // Clamp
    	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    	            words.length = Math.ceil(sigBytes / 4);
    	        },

    	        /**
    	         * Creates a copy of this word array.
    	         *
    	         * @return {WordArray} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = wordArray.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone.words = this.words.slice(0);

    	            return clone;
    	        },

    	        /**
    	         * Creates a word array filled with random bytes.
    	         *
    	         * @param {number} nBytes The number of random bytes to generate.
    	         *
    	         * @return {WordArray} The random word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    	         */
    	        random: function (nBytes) {
    	            var words = [];

    	            for (var i = 0; i < nBytes; i += 4) {
    	                words.push(cryptoSecureRandomInt());
    	            }

    	            return new WordArray.init(words, nBytes);
    	        }
    	    });

    	    /**
    	     * Encoder namespace.
    	     */
    	    var C_enc = C.enc = {};

    	    /**
    	     * Hex encoding strategy.
    	     */
    	    var Hex = C_enc.Hex = {
    	        /**
    	         * Converts a word array to a hex string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The hex string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var hexChars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                hexChars.push((bite >>> 4).toString(16));
    	                hexChars.push((bite & 0x0f).toString(16));
    	            }

    	            return hexChars.join('');
    	        },

    	        /**
    	         * Converts a hex string to a word array.
    	         *
    	         * @param {string} hexStr The hex string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    	         */
    	        parse: function (hexStr) {
    	            // Shortcut
    	            var hexStrLength = hexStr.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < hexStrLength; i += 2) {
    	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    	            }

    	            return new WordArray.init(words, hexStrLength / 2);
    	        }
    	    };

    	    /**
    	     * Latin1 encoding strategy.
    	     */
    	    var Latin1 = C_enc.Latin1 = {
    	        /**
    	         * Converts a word array to a Latin1 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The Latin1 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var latin1Chars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                latin1Chars.push(String.fromCharCode(bite));
    	            }

    	            return latin1Chars.join('');
    	        },

    	        /**
    	         * Converts a Latin1 string to a word array.
    	         *
    	         * @param {string} latin1Str The Latin1 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    	         */
    	        parse: function (latin1Str) {
    	            // Shortcut
    	            var latin1StrLength = latin1Str.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < latin1StrLength; i++) {
    	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    	            }

    	            return new WordArray.init(words, latin1StrLength);
    	        }
    	    };

    	    /**
    	     * UTF-8 encoding strategy.
    	     */
    	    var Utf8 = C_enc.Utf8 = {
    	        /**
    	         * Converts a word array to a UTF-8 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The UTF-8 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            try {
    	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    	            } catch (e) {
    	                throw new Error('Malformed UTF-8 data');
    	            }
    	        },

    	        /**
    	         * Converts a UTF-8 string to a word array.
    	         *
    	         * @param {string} utf8Str The UTF-8 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    	         */
    	        parse: function (utf8Str) {
    	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    	        }
    	    };

    	    /**
    	     * Abstract buffered block algorithm template.
    	     *
    	     * The property blockSize must be implemented in a concrete subtype.
    	     *
    	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    	     */
    	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    	        /**
    	         * Resets this block algorithm's data buffer to its initial state.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm.reset();
    	         */
    	        reset: function () {
    	            // Initial values
    	            this._data = new WordArray.init();
    	            this._nDataBytes = 0;
    	        },

    	        /**
    	         * Adds new data to this block algorithm's buffer.
    	         *
    	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm._append('data');
    	         *     bufferedBlockAlgorithm._append(wordArray);
    	         */
    	        _append: function (data) {
    	            // Convert string to WordArray, else assume WordArray already
    	            if (typeof data == 'string') {
    	                data = Utf8.parse(data);
    	            }

    	            // Append
    	            this._data.concat(data);
    	            this._nDataBytes += data.sigBytes;
    	        },

    	        /**
    	         * Processes available data blocks.
    	         *
    	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    	         *
    	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    	         *
    	         * @return {WordArray} The processed data.
    	         *
    	         * @example
    	         *
    	         *     var processedData = bufferedBlockAlgorithm._process();
    	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    	         */
    	        _process: function (doFlush) {
    	            var processedWords;

    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;
    	            var dataSigBytes = data.sigBytes;
    	            var blockSize = this.blockSize;
    	            var blockSizeBytes = blockSize * 4;

    	            // Count blocks ready
    	            var nBlocksReady = dataSigBytes / blockSizeBytes;
    	            if (doFlush) {
    	                // Round up to include partial blocks
    	                nBlocksReady = Math.ceil(nBlocksReady);
    	            } else {
    	                // Round down to include only full blocks,
    	                // less the number of blocks that must remain in the buffer
    	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    	            }

    	            // Count words ready
    	            var nWordsReady = nBlocksReady * blockSize;

    	            // Count bytes ready
    	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    	            // Process blocks
    	            if (nWordsReady) {
    	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    	                    // Perform concrete-algorithm logic
    	                    this._doProcessBlock(dataWords, offset);
    	                }

    	                // Remove processed words
    	                processedWords = dataWords.splice(0, nWordsReady);
    	                data.sigBytes -= nBytesReady;
    	            }

    	            // Return processed words
    	            return new WordArray.init(processedWords, nBytesReady);
    	        },

    	        /**
    	         * Creates a copy of this object.
    	         *
    	         * @return {Object} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = bufferedBlockAlgorithm.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone._data = this._data.clone();

    	            return clone;
    	        },

    	        _minBufferSize: 0
    	    });

    	    /**
    	     * Abstract hasher template.
    	     *
    	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    	     */
    	    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    	        /**
    	         * Configuration options.
    	         */
    	        cfg: Base.extend(),

    	        /**
    	         * Initializes a newly created hasher.
    	         *
    	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    	         *
    	         * @example
    	         *
    	         *     var hasher = CryptoJS.algo.SHA256.create();
    	         */
    	        init: function (cfg) {
    	            // Apply config defaults
    	            this.cfg = this.cfg.extend(cfg);

    	            // Set initial values
    	            this.reset();
    	        },

    	        /**
    	         * Resets this hasher to its initial state.
    	         *
    	         * @example
    	         *
    	         *     hasher.reset();
    	         */
    	        reset: function () {
    	            // Reset data buffer
    	            BufferedBlockAlgorithm.reset.call(this);

    	            // Perform concrete-hasher logic
    	            this._doReset();
    	        },

    	        /**
    	         * Updates this hasher with a message.
    	         *
    	         * @param {WordArray|string} messageUpdate The message to append.
    	         *
    	         * @return {Hasher} This hasher.
    	         *
    	         * @example
    	         *
    	         *     hasher.update('message');
    	         *     hasher.update(wordArray);
    	         */
    	        update: function (messageUpdate) {
    	            // Append
    	            this._append(messageUpdate);

    	            // Update the hash
    	            this._process();

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Finalizes the hash computation.
    	         * Note that the finalize operation is effectively a destructive, read-once operation.
    	         *
    	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    	         *
    	         * @return {WordArray} The hash.
    	         *
    	         * @example
    	         *
    	         *     var hash = hasher.finalize();
    	         *     var hash = hasher.finalize('message');
    	         *     var hash = hasher.finalize(wordArray);
    	         */
    	        finalize: function (messageUpdate) {
    	            // Final message update
    	            if (messageUpdate) {
    	                this._append(messageUpdate);
    	            }

    	            // Perform concrete-hasher logic
    	            var hash = this._doFinalize();

    	            return hash;
    	        },

    	        blockSize: 512/32,

    	        /**
    	         * Creates a shortcut function to a hasher's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to create a helper for.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHelper: function (hasher) {
    	            return function (message, cfg) {
    	                return new hasher.init(cfg).finalize(message);
    	            };
    	        },

    	        /**
    	         * Creates a shortcut function to the HMAC's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHmacHelper: function (hasher) {
    	            return function (message, key) {
    	                return new C_algo.HMAC.init(hasher, key).finalize(message);
    	            };
    	        }
    	    });

    	    /**
    	     * Algorithm namespace.
    	     */
    	    var C_algo = C.algo = {};

    	    return C;
    	}(Math));


    	return CryptoJS;

    }));
    }(core));

    (function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory(core.exports);
    	}
    }(commonjsGlobal, function (CryptoJS) {

    	(function (Math) {
    	    // Shortcuts
    	    var C = CryptoJS;
    	    var C_lib = C.lib;
    	    var WordArray = C_lib.WordArray;
    	    var Hasher = C_lib.Hasher;
    	    var C_algo = C.algo;

    	    // Initialization and round constants tables
    	    var H = [];
    	    var K = [];

    	    // Compute constants
    	    (function () {
    	        function isPrime(n) {
    	            var sqrtN = Math.sqrt(n);
    	            for (var factor = 2; factor <= sqrtN; factor++) {
    	                if (!(n % factor)) {
    	                    return false;
    	                }
    	            }

    	            return true;
    	        }

    	        function getFractionalBits(n) {
    	            return ((n - (n | 0)) * 0x100000000) | 0;
    	        }

    	        var n = 2;
    	        var nPrime = 0;
    	        while (nPrime < 64) {
    	            if (isPrime(n)) {
    	                if (nPrime < 8) {
    	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
    	                }
    	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

    	                nPrime++;
    	            }

    	            n++;
    	        }
    	    }());

    	    // Reusable object
    	    var W = [];

    	    /**
    	     * SHA-256 hash algorithm.
    	     */
    	    var SHA256 = C_algo.SHA256 = Hasher.extend({
    	        _doReset: function () {
    	            this._hash = new WordArray.init(H.slice(0));
    	        },

    	        _doProcessBlock: function (M, offset) {
    	            // Shortcut
    	            var H = this._hash.words;

    	            // Working variables
    	            var a = H[0];
    	            var b = H[1];
    	            var c = H[2];
    	            var d = H[3];
    	            var e = H[4];
    	            var f = H[5];
    	            var g = H[6];
    	            var h = H[7];

    	            // Computation
    	            for (var i = 0; i < 64; i++) {
    	                if (i < 16) {
    	                    W[i] = M[offset + i] | 0;
    	                } else {
    	                    var gamma0x = W[i - 15];
    	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
    	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
    	                                   (gamma0x >>> 3);

    	                    var gamma1x = W[i - 2];
    	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
    	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
    	                                   (gamma1x >>> 10);

    	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    	                }

    	                var ch  = (e & f) ^ (~e & g);
    	                var maj = (a & b) ^ (a & c) ^ (b & c);

    	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
    	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

    	                var t1 = h + sigma1 + ch + K[i] + W[i];
    	                var t2 = sigma0 + maj;

    	                h = g;
    	                g = f;
    	                f = e;
    	                e = (d + t1) | 0;
    	                d = c;
    	                c = b;
    	                b = a;
    	                a = (t1 + t2) | 0;
    	            }

    	            // Intermediate hash value
    	            H[0] = (H[0] + a) | 0;
    	            H[1] = (H[1] + b) | 0;
    	            H[2] = (H[2] + c) | 0;
    	            H[3] = (H[3] + d) | 0;
    	            H[4] = (H[4] + e) | 0;
    	            H[5] = (H[5] + f) | 0;
    	            H[6] = (H[6] + g) | 0;
    	            H[7] = (H[7] + h) | 0;
    	        },

    	        _doFinalize: function () {
    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;

    	            var nBitsTotal = this._nDataBytes * 8;
    	            var nBitsLeft = data.sigBytes * 8;

    	            // Add padding
    	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    	            data.sigBytes = dataWords.length * 4;

    	            // Hash final blocks
    	            this._process();

    	            // Return final computed hash
    	            return this._hash;
    	        },

    	        clone: function () {
    	            var clone = Hasher.clone.call(this);
    	            clone._hash = this._hash.clone();

    	            return clone;
    	        }
    	    });

    	    /**
    	     * Shortcut function to the hasher's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     *
    	     * @return {WordArray} The hash.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hash = CryptoJS.SHA256('message');
    	     *     var hash = CryptoJS.SHA256(wordArray);
    	     */
    	    C.SHA256 = Hasher._createHelper(SHA256);

    	    /**
    	     * Shortcut function to the HMAC's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     * @param {WordArray|string} key The secret key.
    	     *
    	     * @return {WordArray} The HMAC.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hmac = CryptoJS.HmacSHA256(message, key);
    	     */
    	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    	}(Math));


    	return CryptoJS.SHA256;

    }));
    }(sha256$1));

    var sha256 = sha256$1.exports;

    function getUrlHash(url) {
        const normalizedUrl = normalizeUrl(url);
        const hash = sha256(normalizedUrl).toString();
        return hash;
    }
    // NOTE: Keep in sync with backend WebpageConstuctor.normalize_url()
    function normalizeUrl(url) {
        // remove protocol
        url = url.toLowerCase().replace("www.", "").replace(".html", "").replace(".htm", "");
        // remove url params
        // NOTE: be careful here -- e.g. substack adds ?s=r
        const url_obj = new URL(url);
        Object.entries(url_obj.searchParams).map(([param, _]) => {
            if (param.includes("id")) {
                return;
            }
            if (["p", "q", "t", "e"].includes(param)) {
                return;
            }
            delete url_obj.searchParams[param];
        });
        url_obj.pathname = trimRight(url_obj.pathname, "/");
        // convert back to string
        url = url_obj.toString().replace("https://", "").replace("http://", "");
        return url;
    }
    function trimRight(s, chars) {
        let r = s.length - 1;
        while (chars.indexOf(s[r]) >= 0 && r >= 0) {
            r--;
        }
        return s.slice(0, r + 1);
    }

    /**
     * Implementation of Myers' online approximate string matching algorithm [1],
     * with additional optimizations suggested by [2].
     *
     * This has O((k/w) * n) expected-time where `n` is the length of the
     * text, `k` is the maximum number of errors allowed (always <= the pattern
     * length) and `w` is the word size. Because JS only supports bitwise operations
     * on 32 bit integers, `w` is 32.
     *
     * As far as I am aware, there aren't any online algorithms which are
     * significantly better for a wide range of input parameters. The problem can be
     * solved faster using "filter then verify" approaches which first filter out
     * regions of the text that cannot match using a "cheap" check and then verify
     * the remaining potential matches. The verify step requires an algorithm such
     * as this one however.
     *
     * The algorithm's approach is essentially to optimize the classic dynamic
     * programming solution to the problem by computing columns of the matrix in
     * word-sized chunks (ie. dealing with 32 chars of the pattern at a time) and
     * avoiding calculating regions of the matrix where the minimum error count is
     * guaranteed to exceed the input threshold.
     *
     * The paper consists of two parts, the first describes the core algorithm for
     * matching patterns <= the size of a word (implemented by `advanceBlock` here).
     * The second uses the core algorithm as part of a larger block-based algorithm
     * to handle longer patterns.
     *
     * [1] G. Myers, “A Fast Bit-Vector Algorithm for Approximate String Matching
     * Based on Dynamic Programming,” vol. 46, no. 3, pp. 395–415, 1999.
     *
     * [2] Šošić, M. (2014). An simd dynamic programming c/c++ library (Doctoral
     * dissertation, Fakultet Elektrotehnike i računarstva, Sveučilište u Zagrebu).
     */
    function reverse(s) {
        return s.split("").reverse().join("");
    }
    /**
     * Given the ends of approximate matches for `pattern` in `text`, find
     * the start of the matches.
     *
     * @param findEndFn - Function for finding the end of matches in
     * text.
     * @return Matches with the `start` property set.
     */
    function findMatchStarts(text, pattern, matches) {
        const patRev = reverse(pattern);
        return matches.map((m) => {
            // Find start of each match by reversing the pattern and matching segment
            // of text and searching for an approx match with the same number of
            // errors.
            const minStart = Math.max(0, m.end - pattern.length - m.errors);
            const textRev = reverse(text.slice(minStart, m.end));
            // If there are multiple possible start points, choose the one that
            // maximizes the length of the match.
            const start = findMatchEnds(textRev, patRev, m.errors).reduce((min, rm) => {
                if (m.end - rm.end < min) {
                    return m.end - rm.end;
                }
                return min;
            }, m.end);
            return {
                start,
                end: m.end,
                errors: m.errors,
            };
        });
    }
    /**
     * Return 1 if a number is non-zero or zero otherwise, without using
     * conditional operators.
     *
     * This should get inlined into `advanceBlock` below by the JIT.
     *
     * Adapted from https://stackoverflow.com/a/3912218/434243
     */
    function oneIfNotZero(n) {
        return ((n | -n) >> 31) & 1;
    }
    /**
     * Block calculation step of the algorithm.
     *
     * From Fig 8. on p. 408 of [1], additionally optimized to replace conditional
     * checks with bitwise operations as per Section 4.2.3 of [2].
     *
     * @param ctx - The pattern context object
     * @param peq - The `peq` array for the current character (`ctx.peq.get(ch)`)
     * @param b - The block level
     * @param hIn - Horizontal input delta ∈ {1,0,-1}
     * @return Horizontal output delta ∈ {1,0,-1}
     */
    function advanceBlock(ctx, peq, b, hIn) {
        let pV = ctx.P[b];
        let mV = ctx.M[b];
        const hInIsNegative = hIn >>> 31; // 1 if hIn < 0 or 0 otherwise.
        const eq = peq[b] | hInIsNegative;
        // Step 1: Compute horizontal deltas.
        const xV = eq | mV;
        const xH = (((eq & pV) + pV) ^ pV) | eq;
        let pH = mV | ~(xH | pV);
        let mH = pV & xH;
        // Step 2: Update score (value of last row of this block).
        const hOut = oneIfNotZero(pH & ctx.lastRowMask[b]) -
            oneIfNotZero(mH & ctx.lastRowMask[b]);
        // Step 3: Update vertical deltas for use when processing next char.
        pH <<= 1;
        mH <<= 1;
        mH |= hInIsNegative;
        pH |= oneIfNotZero(hIn) - hInIsNegative; // set pH[0] if hIn > 0
        pV = mH | ~(xV | pH);
        mV = pH & xV;
        ctx.P[b] = pV;
        ctx.M[b] = mV;
        return hOut;
    }
    /**
     * Find the ends and error counts for matches of `pattern` in `text`.
     *
     * Only the matches with the lowest error count are reported. Other matches
     * with error counts <= maxErrors are discarded.
     *
     * This is the block-based search algorithm from Fig. 9 on p.410 of [1].
     */
    function findMatchEnds(text, pattern, maxErrors) {
        if (pattern.length === 0) {
            return [];
        }
        // Clamp error count so we can rely on the `maxErrors` and `pattern.length`
        // rows being in the same block below.
        maxErrors = Math.min(maxErrors, pattern.length);
        const matches = [];
        // Word size.
        const w = 32;
        // Index of maximum block level.
        const bMax = Math.ceil(pattern.length / w) - 1;
        // Context used across block calculations.
        const ctx = {
            P: new Uint32Array(bMax + 1),
            M: new Uint32Array(bMax + 1),
            lastRowMask: new Uint32Array(bMax + 1),
        };
        ctx.lastRowMask.fill(1 << 31);
        ctx.lastRowMask[bMax] = 1 << (pattern.length - 1) % w;
        // Dummy "peq" array for chars in the text which do not occur in the pattern.
        const emptyPeq = new Uint32Array(bMax + 1);
        // Map of UTF-16 character code to bit vector indicating positions in the
        // pattern that equal that character.
        const peq = new Map();
        // Version of `peq` that only stores mappings for small characters. This
        // allows faster lookups when iterating through the text because a simple
        // array lookup can be done instead of a hash table lookup.
        const asciiPeq = [];
        for (let i = 0; i < 256; i++) {
            asciiPeq.push(emptyPeq);
        }
        // Calculate `ctx.peq` - a map of character values to bitmasks indicating
        // positions of that character within the pattern, where each bit represents
        // a position in the pattern.
        for (let c = 0; c < pattern.length; c += 1) {
            const val = pattern.charCodeAt(c);
            if (peq.has(val)) {
                // Duplicate char in pattern.
                continue;
            }
            const charPeq = new Uint32Array(bMax + 1);
            peq.set(val, charPeq);
            if (val < asciiPeq.length) {
                asciiPeq[val] = charPeq;
            }
            for (let b = 0; b <= bMax; b += 1) {
                charPeq[b] = 0;
                // Set all the bits where the pattern matches the current char (ch).
                // For indexes beyond the end of the pattern, always set the bit as if the
                // pattern contained a wildcard char in that position.
                for (let r = 0; r < w; r += 1) {
                    const idx = b * w + r;
                    if (idx >= pattern.length) {
                        continue;
                    }
                    const match = pattern.charCodeAt(idx) === val;
                    if (match) {
                        charPeq[b] |= 1 << r;
                    }
                }
            }
        }
        // Index of last-active block level in the column.
        let y = Math.max(0, Math.ceil(maxErrors / w) - 1);
        // Initialize maximum error count at bottom of each block.
        const score = new Uint32Array(bMax + 1);
        for (let b = 0; b <= y; b += 1) {
            score[b] = (b + 1) * w;
        }
        score[bMax] = pattern.length;
        // Initialize vertical deltas for each block.
        for (let b = 0; b <= y; b += 1) {
            ctx.P[b] = ~0;
            ctx.M[b] = 0;
        }
        // Process each char of the text, computing the error count for `w` chars of
        // the pattern at a time.
        for (let j = 0; j < text.length; j += 1) {
            // Lookup the bitmask representing the positions of the current char from
            // the text within the pattern.
            const charCode = text.charCodeAt(j);
            let charPeq;
            if (charCode < asciiPeq.length) {
                // Fast array lookup.
                charPeq = asciiPeq[charCode];
            }
            else {
                // Slower hash table lookup.
                charPeq = peq.get(charCode);
                if (typeof charPeq === "undefined") {
                    charPeq = emptyPeq;
                }
            }
            // Calculate error count for blocks that we definitely have to process for
            // this column.
            let carry = 0;
            for (let b = 0; b <= y; b += 1) {
                carry = advanceBlock(ctx, charPeq, b, carry);
                score[b] += carry;
            }
            // Check if we also need to compute an additional block, or if we can reduce
            // the number of blocks processed for the next column.
            if (score[y] - carry <= maxErrors &&
                y < bMax &&
                (charPeq[y + 1] & 1 || carry < 0)) {
                // Error count for bottom block is under threshold, increase the number of
                // blocks processed for this column & next by 1.
                y += 1;
                ctx.P[y] = ~0;
                ctx.M[y] = 0;
                let maxBlockScore;
                if (y === bMax) {
                    const remainder = pattern.length % w;
                    maxBlockScore = remainder === 0 ? w : remainder;
                }
                else {
                    maxBlockScore = w;
                }
                score[y] =
                    score[y - 1] +
                        maxBlockScore -
                        carry +
                        advanceBlock(ctx, charPeq, y, carry);
            }
            else {
                // Error count for bottom block exceeds threshold, reduce the number of
                // blocks processed for the next column.
                while (y > 0 && score[y] >= maxErrors + w) {
                    y -= 1;
                }
            }
            // If error count is under threshold, report a match.
            if (y === bMax && score[y] <= maxErrors) {
                if (score[y] < maxErrors) {
                    // Discard any earlier, worse matches.
                    matches.splice(0, matches.length);
                }
                matches.push({
                    start: -1,
                    end: j + 1,
                    errors: score[y],
                });
                // Because `search` only reports the matches with the lowest error count,
                // we can "ratchet down" the max error threshold whenever a match is
                // encountered and thereby save a small amount of work for the remainder
                // of the text.
                maxErrors = score[y];
            }
        }
        return matches;
    }
    /**
     * Search for matches for `pattern` in `text` allowing up to `maxErrors` errors.
     *
     * Returns the start, and end positions and error counts for each lowest-cost
     * match. Only the "best" matches are returned.
     */
    function search$1(text, pattern, maxErrors) {
        const matches = findMatchEnds(text, pattern, maxErrors);
        return findMatchStarts(text, pattern, matches);
    }

    /**
     * @typedef {import('approx-string-match').Match} StringMatch
     */
    /**
     * @typedef Match
     * @prop {number} start - Start offset of match in text
     * @prop {number} end - End offset of match in text
     * @prop {number} score -
     *   Score for the match between 0 and 1.0, where 1.0 indicates a perfect match
     *   for the quote and context.
     */
    /**
     * Find the best approximate matches for `str` in `text` allowing up to `maxErrors` errors.
     *
     * @param {string} text
     * @param {string} str
     * @param {number} maxErrors
     * @return {StringMatch[]}
     */
    function search(text, str, maxErrors) {
        // Do a fast search for exact matches. The `approx-string-match` library
        // doesn't currently incorporate this optimization itself.
        let matchPos = 0;
        let exactMatches = [];
        while (matchPos !== -1) {
            matchPos = text.indexOf(str, matchPos);
            if (matchPos !== -1) {
                exactMatches.push({
                    start: matchPos,
                    end: matchPos + str.length,
                    errors: 0,
                });
                matchPos += 1;
            }
        }
        if (exactMatches.length > 0) {
            return exactMatches;
        }
        // If there are no exact matches, do a more expensive search for matches
        // with errors.
        return search$1(text, str, maxErrors);
    }
    /**
     * Compute a score between 0 and 1.0 for the similarity between `text` and `str`.
     *
     * @param {string} text
     * @param {string} str
     */
    function textMatchScore(text, str) {
        // `search` will return no matches if either the text or pattern is empty,
        // otherwise it will return at least one match if the max allowed error count
        // is at least `str.length`.
        if (str.length === 0 || text.length === 0) {
            return 0.0;
        }
        const matches = search(text, str, str.length);
        // prettier-ignore
        return 1 - (matches[0].errors / str.length);
    }
    /**
     * Find the best approximate match for `quote` in `text`.
     *
     * Returns `null` if no match exceeding the minimum quality threshold was found.
     *
     * @param {string} text - Document text to search
     * @param {string} quote - String to find within `text`
     * @param {Object} context -
     *   Context in which the quote originally appeared. This is used to choose the
     *   best match.
     *   @param {string} [context.prefix] - Expected text before the quote
     *   @param {string} [context.suffix] - Expected text after the quote
     *   @param {number} [context.hint] - Expected offset of match within text
     * @return {Match|null}
     */
    function matchQuote(text, quote, context = {}) {
        if (quote.length === 0) {
            return null;
        }
        // Choose the maximum number of errors to allow for the initial search.
        // This choice involves a tradeoff between:
        //
        //  - Recall (proportion of "good" matches found)
        //  - Precision (proportion of matches found which are "good")
        //  - Cost of the initial search and of processing the candidate matches [1]
        //
        // [1] Specifically, the expected-time complexity of the initial search is
        //     `O((maxErrors / 32) * text.length)`. See `approx-string-match` docs.
        const maxErrors = Math.min(256, quote.length / 2);
        // Find closest matches for `quote` in `text` based on edit distance.
        const matches = search(text, quote, maxErrors);
        if (matches.length === 0) {
            return null;
        }
        /**
         * Compute a score between 0 and 1.0 for a match candidate.
         *
         * @param {StringMatch} match
         */
        const scoreMatch = (match) => {
            const quoteWeight = 50; // Similarity of matched text to quote.
            const prefixWeight = 20; // Similarity of text before matched text to `context.prefix`.
            const suffixWeight = 20; // Similarity of text after matched text to `context.suffix`.
            const posWeight = 2; // Proximity to expected location. Used as a tie-breaker.
            const quoteScore = 1 - match.errors / quote.length;
            const prefixScore = context.prefix
                ? textMatchScore(text.slice(Math.max(0, match.start - context.prefix.length), match.start), context.prefix)
                : 1.0;
            const suffixScore = context.suffix
                ? textMatchScore(text.slice(match.end, match.end + context.suffix.length), context.suffix)
                : 1.0;
            let posScore = 1.0;
            if (typeof context.hint === "number") {
                const offset = Math.abs(match.start - context.hint);
                posScore = 1.0 - offset / text.length;
            }
            const rawScore = quoteWeight * quoteScore +
                prefixWeight * prefixScore +
                suffixWeight * suffixScore +
                posWeight * posScore;
            const maxScore = quoteWeight + prefixWeight + suffixWeight + posWeight;
            const normalizedScore = rawScore / maxScore;
            return normalizedScore;
        };
        // Rank matches based on similarity of actual and expected surrounding text
        // and actual/expected offset in the document text.
        const scoredMatches = matches.map((m) => ({
            start: m.start,
            end: m.end,
            score: scoreMatch(m),
        }));
        // Choose match with highest score.
        scoredMatches.sort((a, b) => b.score - a.score);
        return scoredMatches[0];
    }

    /**
     * Return the combined length of text nodes contained in `node`.
     *
     * @param {Node} node
     */
    function nodeTextLength(node) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
            case Node.TEXT_NODE:
                // nb. `textContent` excludes text in comments and processing instructions
                // when called on a parent element, so we don't need to subtract that here.
                return /** @type {string} */ (node.textContent).length;
            default:
                return 0;
        }
    }
    /**
     * Return the total length of the text of all previous siblings of `node`.
     *
     * @param {Node} node
     */
    function previousSiblingsTextLength(node) {
        let sibling = node.previousSibling;
        let length = 0;
        while (sibling) {
            length += nodeTextLength(sibling);
            sibling = sibling.previousSibling;
        }
        return length;
    }
    /**
     * Resolve one or more character offsets within an element to (text node, position)
     * pairs.
     *
     * @param {Element} element
     * @param {number[]} offsets - Offsets, which must be sorted in ascending order
     * @return {{ node: Text, offset: number }[]}
     */
    function resolveOffsets(element, ...offsets) {
        let nextOffset = offsets.shift();
        const nodeIter = /** @type {Document} */ (element.ownerDocument).createNodeIterator(element, NodeFilter.SHOW_TEXT);
        const results = [];
        let currentNode = nodeIter.nextNode();
        let textNode;
        let length = 0;
        // Find the text node containing the `nextOffset`th character from the start
        // of `element`.
        while (nextOffset !== undefined && currentNode) {
            textNode = /** @type {Text} */ (currentNode);
            if (length + textNode.data.length > nextOffset) {
                results.push({ node: textNode, offset: nextOffset - length });
                nextOffset = offsets.shift();
            }
            else {
                currentNode = nodeIter.nextNode();
                length += textNode.data.length;
            }
        }
        // Boundary case.
        while (nextOffset !== undefined && textNode && length === nextOffset) {
            results.push({ node: textNode, offset: textNode.data.length });
            nextOffset = offsets.shift();
        }
        if (nextOffset !== undefined) {
            throw new RangeError("Offset exceeds text length");
        }
        return results;
    }
    let RESOLVE_FORWARDS = 1;
    let RESOLVE_BACKWARDS = 2;
    /**
     * Represents an offset within the text content of an element.
     *
     * This position can be resolved to a specific descendant node in the current
     * DOM subtree of the element using the `resolve` method.
     */
    class TextPosition {
        /**
         * Construct a `TextPosition` that refers to the text position `offset` within
         * the text content of `element`.
         *
         * @param {Element} element
         * @param {number} offset
         */
        constructor(element, offset) {
            if (offset < 0) {
                throw new Error("Offset is invalid");
            }
            /** Element that `offset` is relative to. */
            this.element = element;
            /** Character offset from the start of the element's `textContent`. */
            this.offset = offset;
        }
        /**
         * Return a copy of this position with offset relative to a given ancestor
         * element.
         *
         * @param {Element} parent - Ancestor of `this.element`
         * @return {TextPosition}
         */
        relativeTo(parent) {
            if (!parent.contains(this.element)) {
                throw new Error("Parent is not an ancestor of current element");
            }
            let el = this.element;
            let offset = this.offset;
            while (el !== parent) {
                offset += previousSiblingsTextLength(el);
                el = /** @type {Element} */ (el.parentElement);
            }
            return new TextPosition(el, offset);
        }
        /**
         * Resolve the position to a specific text node and offset within that node.
         *
         * Throws if `this.offset` exceeds the length of the element's text. In the
         * case where the element has no text and `this.offset` is 0, the `direction`
         * option determines what happens.
         *
         * Offsets at the boundary between two nodes are resolved to the start of the
         * node that begins at the boundary.
         *
         * @param {Object} [options]
         *   @param {RESOLVE_FORWARDS|RESOLVE_BACKWARDS} [options.direction] -
         *     Specifies in which direction to search for the nearest text node if
         *     `this.offset` is `0` and `this.element` has no text. If not specified
         *     an error is thrown.
         * @return {{ node: Text, offset: number }}
         * @throws {RangeError}
         */
        resolve(options = {}) {
            try {
                return resolveOffsets(this.element, this.offset)[0];
            }
            catch (err) {
                if (this.offset === 0 && options.direction !== undefined) {
                    const tw = document.createTreeWalker(this.element.getRootNode(), NodeFilter.SHOW_TEXT);
                    tw.currentNode = this.element;
                    const forwards = options.direction === RESOLVE_FORWARDS;
                    const text = /** @type {Text|null} */ (forwards ? tw.nextNode() : tw.previousNode());
                    if (!text) {
                        throw err;
                    }
                    return { node: text, offset: forwards ? 0 : text.data.length };
                }
                else {
                    throw err;
                }
            }
        }
        /**
         * Construct a `TextPosition` that refers to the `offset`th character within
         * `node`.
         *
         * @param {Node} node
         * @param {number} offset
         * @return {TextPosition}
         */
        static fromCharOffset(node, offset) {
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    return TextPosition.fromPoint(node, offset);
                case Node.ELEMENT_NODE:
                    return new TextPosition(/** @type {Element} */ (node), offset);
                default:
                    throw new Error("Node is not an element or text node");
            }
        }
        /**
         * Construct a `TextPosition` representing the range start or end point (node, offset).
         *
         * @param {Node} node - Text or Element node
         * @param {number} offset - Offset within the node.
         * @return {TextPosition}
         */
        static fromPoint(node, offset) {
            switch (node.nodeType) {
                case Node.TEXT_NODE: {
                    if (offset < 0 || offset > /** @type {Text} */ (node).data.length) {
                        throw new Error("Text node offset is out of range");
                    }
                    if (!node.parentElement) {
                        throw new Error("Text node has no parent");
                    }
                    // Get the offset from the start of the parent element.
                    const textOffset = previousSiblingsTextLength(node) + offset;
                    return new TextPosition(node.parentElement, textOffset);
                }
                case Node.ELEMENT_NODE: {
                    if (offset < 0 || offset > node.childNodes.length) {
                        throw new Error("Child node offset is out of range");
                    }
                    // Get the text length before the `offset`th child of element.
                    let textOffset = 0;
                    for (let i = 0; i < offset; i++) {
                        textOffset += nodeTextLength(node.childNodes[i]);
                    }
                    return new TextPosition(/** @type {Element} */ (node), textOffset);
                }
                default:
                    throw new Error("Point is not in an element or text node");
            }
        }
    }
    /**
     * Represents a region of a document as a (start, end) pair of `TextPosition` points.
     *
     * Representing a range in this way allows for changes in the DOM content of the
     * range which don't affect its text content, without affecting the text content
     * of the range itself.
     */
    class TextRange {
        /**
         * Construct an immutable `TextRange` from a `start` and `end` point.
         *
         * @param {TextPosition} start
         * @param {TextPosition} end
         */
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
        /**
         * Return a copy of this range with start and end positions relative to a
         * given ancestor. See `TextPosition.relativeTo`.
         *
         * @param {Element} element
         */
        relativeTo(element) {
            return new TextRange(this.start.relativeTo(element), this.end.relativeTo(element));
        }
        /**
         * Resolve the `TextRange` to a DOM range.
         *
         * The resulting DOM Range will always start and end in a `Text` node.
         * Hence `TextRange.fromRange(range).toRange()` can be used to "shrink" a
         * range to the text it contains.
         *
         * May throw if the `start` or `end` positions cannot be resolved to a range.
         *
         * @return {Range}
         */
        toRange() {
            let start;
            let end;
            if (this.start.element === this.end.element &&
                this.start.offset <= this.end.offset) {
                // Fast path for start and end points in same element.
                [start, end] = resolveOffsets(this.start.element, this.start.offset, this.end.offset);
            }
            else {
                start = this.start.resolve({ direction: RESOLVE_FORWARDS });
                end = this.end.resolve({ direction: RESOLVE_BACKWARDS });
            }
            const range = new Range();
            range.setStart(start.node, start.offset);
            range.setEnd(end.node, end.offset);
            return range;
        }
        /**
         * Convert an existing DOM `Range` to a `TextRange`
         *
         * @param {Range} range
         * @return {TextRange}
         */
        static fromRange(range) {
            const start = TextPosition.fromPoint(range.startContainer, range.startOffset);
            const end = TextPosition.fromPoint(range.endContainer, range.endOffset);
            return new TextRange(start, end);
        }
        /**
         * Return a `TextRange` from the `start`th to `end`th characters in `root`.
         *
         * @param {Element} root
         * @param {number} start
         * @param {number} end
         */
        static fromOffsets(root, start, end) {
            return new TextRange(new TextPosition(root, start), new TextPosition(root, end));
        }
    }

    /**
     * Get the node name for use in generating an xpath expression.
     *
     * @param {Node} node
     */
    function getNodeName(node) {
        const nodeName = node.nodeName.toLowerCase();
        let result = nodeName;
        if (nodeName === "#text") {
            result = "text()";
        }
        return result;
    }
    /**
     * Get the index of the node as it appears in its parent's child list
     *
     * @param {Node} node
     */
    function getNodePosition(node) {
        let pos = 0;
        /** @type {Node|null} */
        let tmp = node;
        while (tmp) {
            if (tmp.nodeName === node.nodeName) {
                pos += 1;
            }
            tmp = tmp.previousSibling;
        }
        return pos;
    }
    function getPathSegment(node) {
        const name = getNodeName(node);
        const pos = getNodePosition(node);
        return `${name}[${pos}]`;
    }
    /**
     * A simple XPath generator which can generate XPaths of the form
     * /tag[index]/tag[index].
     *
     * @param {Node} node - The node to generate a path to
     * @param {Node} root - Root node to which the returned path is relative
     */
    function xpathFromNode(node, root) {
        let xpath = "";
        /** @type {Node|null} */
        let elem = node;
        while (elem !== root) {
            if (!elem) {
                throw new Error("Node is not a descendant of root");
            }
            xpath = getPathSegment(elem) + "/" + xpath;
            elem = elem.parentNode;
        }
        xpath = "/" + xpath;
        xpath = xpath.replace(/\/$/, ""); // Remove trailing slash
        return xpath;
    }
    /**
     * Return the `index`'th immediate child of `element` whose tag name is
     * `nodeName` (case insensitive).
     *
     * @param {Element} element
     * @param {string} nodeName
     * @param {number} index
     */
    function nthChildOfType(element, nodeName, index) {
        nodeName = nodeName.toUpperCase();
        let matchIndex = -1;
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            if (child.nodeName.toUpperCase() === nodeName) {
                ++matchIndex;
                if (matchIndex === index) {
                    return child;
                }
            }
        }
        return null;
    }
    /**
     * Evaluate a _simple XPath_ relative to a `root` element and return the
     * matching element.
     *
     * A _simple XPath_ is a sequence of one or more `/tagName[index]` strings.
     *
     * Unlike `document.evaluate` this function:
     *
     *  - Only supports simple XPaths
     *  - Is not affected by the document's _type_ (HTML or XML/XHTML)
     *  - Ignores element namespaces when matching element names in the XPath against
     *    elements in the DOM tree
     *  - Is case insensitive for all elements, not just HTML elements
     *
     * The matching element is returned or `null` if no such element is found.
     * An error is thrown if `xpath` is not a simple XPath.
     *
     * @param {string} xpath
     * @param {Element} root
     * @return {Element|null}
     */
    function evaluateSimpleXPath(xpath, root) {
        const isSimpleXPath = xpath.match(/^(\/[A-Za-z0-9-]+(\[[0-9]+\])?)+$/) !== null;
        if (!isSimpleXPath) {
            throw new Error("Expression is not a simple XPath");
        }
        const segments = xpath.split("/");
        let element = root;
        // Remove leading empty segment. The regex above validates that the XPath
        // has at least two segments, with the first being empty and the others non-empty.
        segments.shift();
        for (let segment of segments) {
            let elementName;
            let elementIndex;
            const separatorPos = segment.indexOf("[");
            if (separatorPos !== -1) {
                elementName = segment.slice(0, separatorPos);
                const indexStr = segment.slice(separatorPos + 1, segment.indexOf("]"));
                elementIndex = parseInt(indexStr) - 1;
                if (elementIndex < 0) {
                    return null;
                }
            }
            else {
                elementName = segment;
                elementIndex = 0;
            }
            const child = nthChildOfType(element, elementName, elementIndex);
            if (!child) {
                return null;
            }
            element = child;
        }
        return element;
    }
    /**
     * Finds an element node using an XPath relative to `root`
     *
     * Example:
     *   node = nodeFromXPath('/main/article[1]/p[3]', document.body)
     *
     * @param {string} xpath
     * @param {Element} [root]
     * @return {Node|null}
     */
    function nodeFromXPath(xpath, root = document.body) {
        try {
            return evaluateSimpleXPath(xpath, root);
        }
        catch (err) {
            return document.evaluate("." + xpath, root, 
            // nb. The `namespaceResolver` and `result` arguments are optional in the spec
            // but required in Edge Legacy.
            null /* namespaceResolver */, XPathResult.FIRST_ORDERED_NODE_TYPE, null /* result */).singleNodeValue;
        }
    }

    /**
     * This module exports a set of classes for converting between DOM `Range`
     * objects and different types of selectors. It is mostly a thin wrapper around a
     * set of anchoring libraries. It serves two main purposes:
     *
     *  1. Providing a consistent interface across different types of anchors.
     *  2. Insulating the rest of the code from API changes in the underlying anchoring
     *     libraries.
     */
    /**
     * @typedef {import('../../types/api').RangeSelector} RangeSelector
     * @typedef {import('../../types/api').TextPositionSelector} TextPositionSelector
     * @typedef {import('../../types/api').TextQuoteSelector} TextQuoteSelector
     */
    /**
     * Converts between `RangeSelector` selectors and `Range` objects.
     */
    class RangeAnchor {
        /**
         * @param {Node} root - A root element from which to anchor.
         * @param {Range} range -  A range describing the anchor.
         */
        constructor(root, range) {
            this.root = root;
            this.range = range;
        }
        /**
         * @param {Node} root -  A root element from which to anchor.
         * @param {Range} range -  A range describing the anchor.
         */
        static fromRange(root, range) {
            return new RangeAnchor(root, range);
        }
        /**
         * Create an anchor from a serialized `RangeSelector` selector.
         *
         * @param {Element} root -  A root element from which to anchor.
         * @param {RangeSelector} selector
         */
        static fromSelector(root, selector) {
            const startContainer = nodeFromXPath(selector.startContainer, root);
            if (!startContainer) {
                throw new Error("Failed to resolve startContainer XPath");
            }
            const endContainer = nodeFromXPath(selector.endContainer, root);
            if (!endContainer) {
                throw new Error("Failed to resolve endContainer XPath");
            }
            const startPos = TextPosition.fromCharOffset(startContainer, selector.startOffset);
            const endPos = TextPosition.fromCharOffset(endContainer, selector.endOffset);
            const range = new TextRange(startPos, endPos).toRange();
            return new RangeAnchor(root, range);
        }
        toRange() {
            return this.range;
        }
        /**
         * @return {RangeSelector}
         */
        toSelector() {
            // "Shrink" the range so that it tightly wraps its text. This ensures more
            // predictable output for a given text selection.
            const normalizedRange = TextRange.fromRange(this.range).toRange();
            const textRange = TextRange.fromRange(normalizedRange);
            const startContainer = xpathFromNode(textRange.start.element, this.root);
            const endContainer = xpathFromNode(textRange.end.element, this.root);
            return {
                type: "RangeSelector",
                startContainer,
                startOffset: textRange.start.offset,
                endContainer,
                endOffset: textRange.end.offset,
            };
        }
    }
    /**
     * Converts between `TextPositionSelector` selectors and `Range` objects.
     */
    class TextPositionAnchor {
        /**
         * @param {Element} root
         * @param {number} start
         * @param {number} end
         */
        constructor(root, start, end) {
            this.root = root;
            this.start = start;
            this.end = end;
        }
        /**
         * @param {Element} root
         * @param {Range} range
         */
        static fromRange(root, range) {
            const textRange = TextRange.fromRange(range).relativeTo(root);
            return new TextPositionAnchor(root, textRange.start.offset, textRange.end.offset);
        }
        /**
         * @param {Element} root
         * @param {TextPositionSelector} selector
         */
        static fromSelector(root, selector) {
            return new TextPositionAnchor(root, selector.start, selector.end);
        }
        /**
         * @return {TextPositionSelector}
         */
        toSelector() {
            return {
                type: "TextPositionSelector",
                start: this.start,
                end: this.end,
            };
        }
        toRange() {
            return TextRange.fromOffsets(this.root, this.start, this.end).toRange();
        }
    }
    /**
     * @typedef QuoteMatchOptions
     * @prop {number} [hint] - Expected position of match in text. See `matchQuote`.
     */
    /**
     * Converts between `TextQuoteSelector` selectors and `Range` objects.
     */
    class TextQuoteAnchor {
        /**
         * @param {Element} root - A root element from which to anchor.
         * @param {string} exact
         * @param {Object} context
         *   @param {string} [context.prefix]
         *   @param {string} [context.suffix]
         */
        constructor(root, exact, context = {}) {
            this.root = root;
            this.exact = exact;
            this.context = context;
        }
        /**
         * Create a `TextQuoteAnchor` from a range.
         *
         * Will throw if `range` does not contain any text nodes.
         *
         * @param {Element} root
         * @param {Range} range
         */
        static fromRange(root, range) {
            const text = /** @type {string} */ (root.textContent);
            const textRange = TextRange.fromRange(range).relativeTo(root);
            const start = textRange.start.offset;
            const end = textRange.end.offset;
            // Number of characters around the quote to capture as context. We currently
            // always use a fixed amount, but it would be better if this code was aware
            // of logical boundaries in the document (paragraph, article etc.) to avoid
            // capturing text unrelated to the quote.
            //
            // In regular prose the ideal content would often be the surrounding sentence.
            // This is a natural unit of meaning which enables displaying quotes in
            // context even when the document is not available. We could use `Intl.Segmenter`
            // for this when available.
            const contextLen = 32;
            return new TextQuoteAnchor(root, text.slice(start, end), {
                prefix: text.slice(Math.max(0, start - contextLen), start),
                suffix: text.slice(end, Math.min(text.length, end + contextLen)),
            });
        }
        /**
         * @param {Element} root
         * @param {TextQuoteSelector} selector
         */
        static fromSelector(root, selector) {
            const { prefix, suffix } = selector;
            return new TextQuoteAnchor(root, selector.exact, { prefix, suffix });
        }
        /**
         * @return {TextQuoteSelector}
         */
        toSelector() {
            return {
                type: "TextQuoteSelector",
                exact: this.exact,
                prefix: this.context.prefix,
                suffix: this.context.suffix,
            };
        }
        /**
         * @param {QuoteMatchOptions} [options]
         */
        toRange(options = {}) {
            return this.toPositionAnchor(options).toRange();
        }
        /**
         * @param {QuoteMatchOptions} [options]
         */
        toPositionAnchor(options = {}) {
            const text = /** @type {string} */ (this.root.textContent);
            const match = matchQuote(text, this.exact, {
                ...this.context,
                hint: options.hint,
            });
            if (!match) {
                throw new Error("Quote not found");
            }
            return new TextPositionAnchor(this.root, match.start, match.end);
        }
    }

    /**
     * @param {Element} root
     * @param {Range} range
     */
    function describe(root, range) {
        const types = [RangeAnchor, TextPositionAnchor, TextQuoteAnchor];
        const result = [];
        for (let type of types) {
            try {
                const anchor = type.fromRange(root, range);
                result.push(anchor.toSelector());
            }
            catch (error) {
                continue;
            }
        }
        return result;
    }

    function listParagraphs(document, isJsdom = false) {
        const paragraphsElements = [];
        const paragraphTexts = [];
        document.querySelectorAll("p, font, li").forEach((paragraph) => {
            var _a;
            // Ignore invisible nodes
            if (!isJsdom && paragraph.offsetHeight === 0) {
                return false;
            }
            // check text content (textContent to anchor range correctly)
            const rawText = paragraph.textContent;
            const cleanText = rawText === null || rawText === void 0 ? void 0 : rawText.replace(/[\s\n]+/g, " ").trim();
            if (!rawText || !cleanText || cleanText.length < 200) {
                return;
            }
            // check classes
            if (excludedParagraphClassNames.some((word) => paragraph.className.toLowerCase().includes(word)) ||
                excludedParagraphClassNames.some((word) => { var _a; return (_a = paragraph.parentElement) === null || _a === void 0 ? void 0 : _a.className.toLowerCase().includes(word); }) ||
                excludedParagraphClassNames.some((word) => { var _a, _b; return (_b = (_a = paragraph.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.className.toLowerCase().includes(word); })) {
                return;
            }
            if (paragraph.tagName === "CODE" || ((_a = paragraph.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === "CODE") {
                return;
            }
            paragraphsElements.push(paragraph);
            // use raw text content to anchor sentences correctly later
            paragraphTexts.push(rawText);
        });
        return [paragraphsElements, paragraphTexts];
    }
    const excludedParagraphClassNames = [
        "comment",
        "reference", // https://en.wikipedia.org/wiki/Sunstone_(medieval)
    ];
    function createAnnotations(document, paragraphElements, rankedSentencesByParagraph, article_id, scoreThreshold) {
        const annotations = [];
        const created_at = Math.round(new Date().getTime() / 1000);
        let runningCount = 0;
        paragraphElements.forEach((paragraph, index) => {
            const rankedSentences = rankedSentencesByParagraph === null || rankedSentencesByParagraph === void 0 ? void 0 : rankedSentencesByParagraph[index];
            if (!rankedSentences) {
                return;
            }
            // anchor all sentences to use correct offsets
            let ranges = anchorParagraphSentences(document, paragraph, rankedSentences.map((s) => s.sentence));
            // construct global annotationState
            ranges.forEach((range, i) => {
                const sentence = rankedSentences[i];
                // filter to only important sentences
                if (sentence.score < scoreThreshold) {
                    return;
                }
                annotations.push({
                    id: `ai_${article_id.slice(0, 20)}_${runningCount}`,
                    article_id,
                    quote_text: sentence.sentence.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
                    created_at,
                    quote_html_selector: describe(document.body, range),
                    ai_created: true,
                    ai_score: sentence.score,
                });
                runningCount++;
            });
        });
        return annotations;
    }
    // create ranges for each sentence by iterating leaf children
    function anchorParagraphSentences(document, paragraph, sentences) {
        var _a;
        const ranges = [];
        let currentElem = paragraph;
        let runningTextLength = 0;
        let currentRange = document.createRange();
        currentRange.setStart(currentElem, 0);
        // console.log(paragraph.textContent, sentences);
        while (ranges.length < sentences.length) {
            // console.log(currentElem);
            if (!currentElem) {
                break;
            }
            const currentSentence = sentences[ranges.length];
            let currentSentenceLength = currentSentence.length;
            const currentLength = ((_a = currentElem.textContent) === null || _a === void 0 ? void 0 : _a.length) || 0;
            // assume trailing space removed in backend
            // TODO handle this better
            let hasTrailingSpace = currentSentence.endsWith(" ");
            if (!hasTrailingSpace && ranges.length < sentences.length - 1) {
                // add space if middle sentence
                hasTrailingSpace = true;
                currentSentenceLength += 1;
            }
            if (runningTextLength + currentLength < currentSentenceLength) {
                // not enough text, skip entire node subtree
                // console.log("skip", runningTextLength, currentLength, currentSentenceLength);
                runningTextLength += currentLength;
                // get next sibling of closest parent
                // e.g. not direct parent on https://hardpivot.substack.com/p/why-we-stopped-working-on-athens
                let nextElem = undefined;
                while (paragraph.contains(currentElem)) {
                    if (currentElem.nextSibling) {
                        nextElem = currentElem.nextSibling;
                        break;
                    }
                    currentElem = currentElem.parentElement;
                }
                if (nextElem) {
                    currentElem = nextElem;
                }
                else {
                    // end of paragraph (likely count error)
                    // console.log("break", currentElem);
                    // TODO parent not defined, e.g. on https://www.theatlantic.com/ideas/archive/2022/12/volodymyr-zelensky-visit-ukraine-united-states/672528/
                    currentRange.setEndAfter(paragraph);
                    ranges.push(currentRange);
                    break;
                }
            }
            else {
                if (currentElem.childNodes.length > 0) {
                    // iterate children
                    // console.log("iterate children");
                    currentElem = currentElem.childNodes[0];
                    continue;
                }
                else {
                    // slice text content
                    // console.log("slice", runningTextLength, currentLength, currentSentenceLength);
                    // sentence ends inside this node
                    const offset = currentSentenceLength - runningTextLength;
                    currentRange.setEnd(currentElem, offset - (hasTrailingSpace ? 1 : 0));
                    ranges.push(currentRange);
                    // console.log(currentRange.toString());
                    // start new range
                    currentRange = document.createRange();
                    currentRange.setStart(currentElem, offset);
                    runningTextLength = -offset; // handle in next iteration
                    // console.log("---");
                }
            }
        }
        // console.log(ranges.map((r) => r.toString()));
        return ranges;
    }

    // analyse an article page and highlight key sentences using an in-browser AI model
    let SmartHighlightsModifier = class SmartHighlightsModifier {
        constructor() {
            this.scoreThreshold = 0.6;
            this.article_id = getUrlHash(window.location.href);
        }
        async parseAnnotationsFromArticle() {
            // console.log(`Generating AI highlights for article...`);
            let start = performance.now();
            // parse DOM and extract significant text elements
            const [paragraphsElements, paragraphTexts] = listParagraphs(document);
            if (paragraphTexts.length === 0 || paragraphTexts.length >= 200) {
                // likely not an article
                // be careful, e.g. paulgraham.com has single paragraph
                return [];
            }
            // detect most important quotes on page using an AI model
            let rankedSentencesByParagraph;
            try {
                rankedSentencesByParagraph = await browserObj.runtime.sendMessage(null, {
                    event: "getHeatmap",
                    paragraphs: paragraphTexts,
                });
            }
            catch (err) {
                console.error(err);
                return [];
            }
            // create annotations for significant detected quotes
            const newAnnotations = createAnnotations(document, paragraphsElements, rankedSentencesByParagraph, this.article_id, this.scoreThreshold);
            // report diagnostics
            let durationMs = Math.round(performance.now() - start);
            // console.log(`Generated ${newAnnotations.length} AI highlights in ${durationMs}ms`);
            reportEventContentScript("generateAIHighlights", {
                paragraphCount: paragraphsElements.length,
                annotationsCount: newAnnotations.length,
                durationMs,
            });
            return newAnnotations;
        }
    };
    SmartHighlightsModifier = __decorate([
        trackModifierExecution
    ], SmartHighlightsModifier);
    var SmartHighlightsModifier$1 = SmartHighlightsModifier;

    // "light" extension functionality injected into a tab if configured by the user
    // this enables the "smart reading" AI highlights
    async function main() {
        // @ts-ignore
        window.unclutterHighlightsLoaded = true;
        const smartHighlightsModifier = new SmartHighlightsModifier$1();
        const annotations = await smartHighlightsModifier.parseAnnotationsFromArticle();
        await browserObj.runtime.sendMessage(null, {
            event: "setParsedAnnotations",
            annotations,
        });
        // const preparePageView = renderHighlightsLayer(userInfo.id, enablePageView, enhanceActive);
        // if (!enhanceActive) {
        //     handleEvents(preparePageView);
        // }
    }
    // function enablePageView() {
    //     browser.runtime.sendMessage(null, {
    //         event: "requestEnhance",
    //         trigger: "highlights-layer",
    //         type: "full",
    //     });
    // }
    // // handle background events until enhance.ts active, to ensure highlights cleanup code is called
    // function handleEvents(preparePageView) {
    //     function onMessage(message, sender, sendResponse) {
    //         if (message.event === "ping") {
    //             sendResponse({ pageViewEnabled: false });
    //             return true;
    //         } else if (message.event === "togglePageView") {
    //             browser.runtime.onMessage.removeListener(onMessage);
    //             preparePageView();
    //             enablePageView();
    //             return false;
    //         }
    //     }
    //     browser.runtime.onMessage.addListener(onMessage);
    // }
    main();

})();
