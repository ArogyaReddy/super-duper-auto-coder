// Login utilities using SBS_Automation patterns
const { By } = require('selenium-webdriver');

class LoginUtilities {
  constructor(driver) {
    this.driver = driver;
    this.elements = {
  "loginButton": "[data-test-id=\"login-button\"]",
  "usernameField": "#username",
  "passwordField": "#password",
  "submitButton": "button[type=\"submit\"]"
};
    this.testData = {
  "defaultUser": "testuser",
  "defaultPassword": "password",
  "clientId": "test-client-123"
};
  }

  async performLogin(userType = 'standard') {
    const credentials = this.testData.users[userType];
    
    await this.driver.findElement(By.css(this.elements.usernameField)).sendKeys(credentials.username);
    await this.driver.findElement(By.css(this.elements.passwordField)).sendKeys(credentials.password);
    await this.driver.findElement(By.css(this.elements.loginButton)).click();
    
    // Wait for login completion
    await this.driver.wait(
      until.elementLocated(By.css(this.elements.logoutButton)),
      10000
    );
  }

  async logout() {
    const logoutElement = await this.driver.findElement(By.css(this.elements.logoutButton));
    await logoutElement.click();
  }
}

module.exports = LoginUtilities;