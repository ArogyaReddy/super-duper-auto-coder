# Test Login Feature

## User Story
As a user, I want to login to the application

## Acceptance Criteria
- User can enter username and password
- User can click login button
- User is redirected to dashboard after successful login

## Test Scenarios

### Scenario: Successful Login
Given I am on the login page
When I enter valid credentials
And I click the login button
Then I should be redirected to the dashboard
And I should see welcome message
