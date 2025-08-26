const { Given, When, Then } = require('@cucumber/cucumber');
const UserLoginPage = require('../pages/user-login-page');

Given('I am on the home page', async function () {
    await this.userLoginPage.navigateToHomePage();
});

When('I navigate to login page', async function () {
    await this.userLoginPage.navigateToLoginPage();
});

Then('I should see the login form', async function () {
    await this.userLoginPage.verifyLoginFormVisible();
});

Given('I am on the login page', async function () {
    await this.userLoginPage.navigateToLoginPage();
});

When('I enter valid username and password', async function () {
    await this.userLoginPage.enterValidUsernameAndPassword();
});

Then('the credentials should be accepted', async function () {
    await this.userLoginPage.verifyCredentialsAccepted();
});

Given('I have entered valid credentials', async function () {
    await this.userLoginPage.enterValidUsernameAndPassword();
});

When('I click login button', async function () {
    await this.userLoginPage.clickLoginButton();
});

Then('I should be redirected to dashboard', async function () {
    await this.userLoginPage.verifyRedirectedToDashboard();
});

Given('I have logged in successfully', async function () {
    await this.userLoginPage.loginSuccessfully();
});

When('the system validates credentials', async function () {
    await this.userLoginPage.validateCredentials();
});

Then('I should see success message', async function () {
    await this.userLoginPage.verifySuccessMessage();
});
