@Generated @Template @Team:AutoCoder
Feature: BDD Template Feature
  As a test automation engineer
  I want to use this BDD template
  So that I can quickly create comprehensive test scenarios

  Background:
    Given Alex is logged into RunMod with a homepage test client
    Then Alex verifies that the Payroll section on the Home Page is displayed

  @smoke @priority:high
  Scenario: Template smoke test scenario
    Given I am on the application page
    When I perform the primary action
    Then I should see the expected result
    And the system should behave correctly

  @regression @priority:medium  
  Scenario Outline: Template data-driven scenario
    Given I am on the <pageType> page
    When I enter "<inputData>" in the form
    Then I should see "<expectedOutput>" displayed
    
    Examples:
      | pageType | inputData | expectedOutput |
      | main     | test123   | Success        |
      | admin    | admin456  | Admin Success  |

  @negative @priority:low
  Scenario: Template negative test scenario
    Given I am on the application page
    When I enter invalid data
    Then I should see an appropriate error message
    And the system should remain stable
