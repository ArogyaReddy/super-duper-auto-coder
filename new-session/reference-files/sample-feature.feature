Feature: User Login Process
  Background:
    Given the application is loaded
    
  Scenario: User can navigate to login page
    Given I am on the home page
    When I navigate to login page
    Then I should see the login form
    
  Scenario: User can enter valid username and password
    Given I am on the login page
    When I enter valid username and password
    Then the credentials should be accepted
    
  Scenario: User can click login button and be redirected to dashboard  
    Given I have entered valid credentials
    When I click login button
    Then I should be redirected to dashboard
    
  Scenario: System validates credentials and displays success message
    Given I have logged in successfully
    When the system validates credentials
    Then I should see success message
