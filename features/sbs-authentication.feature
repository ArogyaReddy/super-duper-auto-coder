Feature: Auto-Coder Authentication using SBS_Automation

  @auto-coder-login
  Scenario: Client user login for auto-coder tests
    Given Alex is logged into RunMod with a homepage test client
    Then login should be successful for auto-coder integration

  @auto-coder-service
  Scenario: Service user login for auto-coder tests  
    Given Alex is logged into RunMod as a owner user
    Then login should be successful for auto-coder service integration
