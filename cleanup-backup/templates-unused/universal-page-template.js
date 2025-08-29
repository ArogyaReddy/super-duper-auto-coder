const By = require('../../support/By.js');
const BasePage = require('./base-page');

{{LOCATOR_DEFINITIONS}}

class RunModHomePage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

{{METHOD_IMPLEMENTATIONS}}
}

module.exports = {{CLASS_NAME}};