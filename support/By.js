/**
 * SBS-style By locator helpers
 * Extracted from SBS_Automation patterns
 */

class By {
  static css(selector) {
    return selector;
  }

  static testId(testId) {
    return `[data-testid="${testId}"]`;
  }

  static id(id) {
    return `#${id}`;
  }

  static className(className) {
    return `.${className}`;
  }

  static xpath(xpath) {
    return `xpath=${xpath}`;
  }

  static text(text) {
    return `:text("${text}")`;
  }

  static role(role, options = {}) {
    let selector = `role=${role}`;
    if (options.name) {
      selector += `[name="${options.name}"]`;
    }
    return selector;
  }

  static placeholder(placeholder) {
    return `[placeholder="${placeholder}"]`;
  }

  static ariaLabel(label) {
    return `[aria-label="${label}"]`;
  }

  static button(text) {
    return `button:has-text("${text}")`;
  }

  static link(text) {
    return `a:has-text("${text}")`;
  }

  static input(type) {
    return `input[type="${type}"]`;
  }
}

module.exports = By;
