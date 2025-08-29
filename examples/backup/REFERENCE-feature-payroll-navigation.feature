@Team:Agnostics
@parentSuite:Payroll
@regression @critical @Home-SmokeTests @Payroll-SmokeTests
Feature: Payroll Landing Page Navigation Checks

Background: An Associate user logs in and navigates to the Payroll homepage
    Given An Associate user logs into Runmod
    And Alex searches for a payroll homepage test IID
    When Alex clicks on the "Payroll" Left Menu icon

Scenario: To validate navigating to various sections on the Payroll Landing page
    Then Alex verifies that runmod payroll landing page is displayed
        And Settings icon is displayed on payroll landing page
    When Alex navigates to company settings page by clicking on settings button on Payroll landing page
        And Alex clicks on the "Payroll" Left Menu icon
    When Alex selects Calculate Checks tile on the Payroll landing page
    Then Alex verifies the Calculate Checks page has loaded
    When Alex clicks close icon in PCC Modal
        And Alex clicks ok button in message popup on closing PCC  
    When Alex selects Check and Payment Options tile on the Payroll landing page
    Then Alex verifies the Check and Payment Option modal is displayed
    When Alex closes Modal box displayed on Payroll landing page
        And Alex selects More payroll options tile on the Payroll landing page
    Then Alex verifies the More Payroll Options Overflow is displayed
