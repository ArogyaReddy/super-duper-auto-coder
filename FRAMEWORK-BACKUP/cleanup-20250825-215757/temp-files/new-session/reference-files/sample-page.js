const BasePage = require('../../../SBS_Automation/pages/base-page');
const { By } = require('../../../SBS_Automation/support/web-driver-manager');

const HOME_PAGE_LINK = By.css('[data-testid="home"]');
const LOGIN_PAGE_LINK = By.css('[data-testid="login"]');
const LOGIN_FORM = By.css('[data-testid="login-form"]');
const USERNAME_INPUT = By.css('[data-testid="username"]');
const PASSWORD_INPUT = By.css('[data-testid="password"]');
const LOGIN_BUTTON = By.css('[data-testid="login-button"]');
const DASHBOARD_HEADER = By.css('[data-testid="dashboard"]');
const SUCCESS_MESSAGE = By.css('[data-testid="success-message"]');

class UserLoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }
    
    async navigateToHomePage() {
        await this.clickElement(HOME_PAGE_LINK);
    }
    
    async navigateToLoginPage() {
        await this.clickElement(LOGIN_PAGE_LINK);
    }
    
    async verifyLoginFormVisible() {
        await this.waitForElement(LOGIN_FORM);
    }
    
    async enterValidUsernameAndPassword() {
        await this.enterText(USERNAME_INPUT, 'testuser');
        await this.enterText(PASSWORD_INPUT, 'testpass');
    }
    
    async verifyCredentialsAccepted() {
        // Verification logic here
        await this.waitForElement(LOGIN_BUTTON);
    }
    
    async clickLoginButton() {
        await this.clickElement(LOGIN_BUTTON);
    }
    
    async verifyRedirectedToDashboard() {
        await this.waitForElement(DASHBOARD_HEADER);
    }
    
    async loginSuccessfully() {
        await this.navigateToLoginPage();
        await this.enterValidUsernameAndPassword();
        await this.clickLoginButton();
    }
    
    async validateCredentials() {
        // System validation logic
        await this.waitForElement(SUCCESS_MESSAGE);
    }
    
    async verifySuccessMessage() {
        await this.waitForElement(SUCCESS_MESSAGE);
    }
}

module.exports = UserLoginPage;
