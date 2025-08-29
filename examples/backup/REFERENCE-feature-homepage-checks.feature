@Team:Kokoro
@parentSuite:Home
@regression @critical @Home-SmokeTests
Feature: Home Page Checks

Scenario: Validate that the different tile sections on the homepage are displayed

Given Alex is logged into RunMod with a homepage test client
Then Alex verifies that the Payroll section on the Home Page is displayed
And Alex verifies that the To Dos section on the Home Page is displayed
And Alex verifies that the Grow Your Own Business section on the Home Page is displayed
And Alex verifies that the Latest Payroll section on the Home Page is displayed
And Alex verifies that the Calendar section on the Home Page is displayed
And Alex verifies that the Report section on the Home Page is displayed
And Alex verifies that the Run Payroll button is displayed


Scenario: Validate that the Notifications slider is displayed when the View All Notifications link is clicked

Given Alex is logged into RunMod with a homepage test client
When Alex clicks on the view all notifications link
Then Alex verifies the Notifications tab is displayed


Scenario: Validate the notifications slider when logged in as an client user

Given Alex is logged into RunMod with a homepage test client
When Alex clicks on Notifications icon on the header
Then Alex verifies the Notifications tab is displayed
And Alex verifies the All tab on the Notifications slider is displayed


Scenario: Navigate to the Home page using the left nav

Given Alex is logged into RunMod with a homepage test client
When Alex clicks on the "Payroll" Left Menu icon
And Clicks on the "Home" menu icon on the LeftNav
Then RUN Homepage is displayed


Scenario: Navigate to the Payroll page using the left nav

Given Alex is logged into RunMod with a homepage test client
When Alex clicks on the "Payroll" Left Menu icon
Then Alex verifies that runmod payroll landing page is displayed
