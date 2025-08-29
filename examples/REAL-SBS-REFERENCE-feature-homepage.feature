@Team:Kokoro
@parentSuite:Home
@regression @Home-SmokeTests
Feature: Home Page Real SBS Patterns

@jira=SBSRUNCORE-89332
Scenario: Alex can navigate and interact with home page elements
Given Alex is logged into RunMod with a homepage test client
When Alex searches for an option "Employee Management" in home page
Then Alex verifies that the option "Employee Management" is displayed in search results
When Alex clicks on option "Employee Management" in search result
Then Alex verifies that Employee Management page is displayed

Scenario: Alex can access payroll functionality from home page
Given Alex is logged into RunMod with a homepage test client
When Alex launches full offcycle payrun from home page
And Alex waits for 10 seconds
Then Alex verifies that the Latest Payroll section on the Home Page is displayed

Scenario: Alex can view and interact with home page sections
Given Alex is logged into RunMod with a homepage test client
Then Alex verifies that the Payroll section on the Home Page is displayed
And Alex verifies that the ToDo section on the Home Page is displayed
And Alex verifies that the Latest Payroll section on the Home Page is displayed