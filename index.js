/*
 * Copyright 2024 MicroEJ Corp. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be found with this software.
 */

import {BaseDriver, errors} from 'appium/driver.js';
import {util} from 'appium/support.js';
const { W3C_WEB_ELEMENT_IDENTIFIER } = util;
import axios from 'axios';

export class MicroEJDriver extends BaseDriver {

	constructor(...args) {
		super(...args)
		this.microejProxyUrl = "http://localhost:4724/"
		this.locatorStrategies = ["id"]
	}

	async findElOrEls(strategy, selector, mult, context) {
		let response = await this.sendCommand("findElementById/" + selector)
		if (mult) {
			let elements = []
			response.forEach((elementId) => {
				elements.push({ [W3C_WEB_ELEMENT_IDENTIFIER]: elementId })
			})
			return elements
		} else {
			if (response.length == 0) {
				throw new errors.NoSuchElementError()
			}
			return { [W3C_WEB_ELEMENT_IDENTIFIER]: "" + response[0] } // return first element
		}
	}

	async click(elementId, sessionId) {
		await this.sendCommand("click/" + elementId)
	}

	async getText(elementId, sessionId) {
		let text = await this.sendCommand("getText/" + elementId)
		if (typeof text == "number") {
			text = " " + text // avoid auto-cast to number
		}
		return text
	}

	async getScreenshot() {
		return this.sendCommand("screenshot")
	}

	async getWindowRect() {
		return this.sendCommand("getWindowRect")
	}

	async getPageSource() {
		return this.sendCommand("getPageSource")
	}

	async elementDisplayed(elementId, sessionId) {
		return this.sendCommand("isDisplayed/" + elementId)
	}

	async elementEnabled(elementId, sessionId) {
		return this.sendCommand("isEnabled/" + elementId)
	}

	async getAttribute(name, elementId, sessionId) {
		return this.sendCommand("getAttribute/" + elementId + "/attribute/" + name)
	}

	async performActions(actions, sessionId) {
		await this.sendCommandWithPayload("performActions", actions)
	}

	async deleteCookies(sessionId) {
      // This method is not called anywhere in the code, so its implementation is not provided.
    }

    async deleteCookie(name, sessionId) {
     // This method is not called anywhere in the code, so its implementation is not provided.
    }

	async sendCommand(path) {
		let response
		try {
			response = await axios.get(this.microejProxyUrl + path)
		} catch (e) {
			if (!e.response) {
				throw new errors.SessionNotCreatedError("Could not connect to " + this.microejProxyUrl)
			}
			if (e.response.status == 400) {
				throw new errors.UnsupportedOperationError()
			}
			throw new errors.ProxyRequestError(e.response.statusText)
		}
		return response.data
	}

	async sendCommandWithPayload(path, payload) {
		let response
		try {
			response = await axios.post(this.microejProxyUrl + path, payload)
		} catch (e) {
			if (!e.response) {
				throw new errors.SessionNotCreatedError("Could not connect to " + this.microejProxyUrl)
			}
			if (e.response.status == 400) {
				throw new errors.UnsupportedOperationError()
			}
			throw new errors.ProxyRequestError(e.response.statusText)
		}
		return response.data
	}

	 async getElementRect(elementId, sessionId) {
            return this.sendCommand("getRect/" + elementId)
        }

        async getCssProperty(propertyName, elementId, sessionId) {
            return this.sendCommand("getCss/" + elementId + "/css/" + propertyName)
        }

}
