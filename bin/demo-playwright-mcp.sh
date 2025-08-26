#!/bin/bash

# 🎭 PLAYWRIGHT MCP INTEGRATION - DEMO WORKFLOW
# Complete demonstration of the Playwright MCP test execution and auto-fix system

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Demo configuration
DEMO_DIR="/Users/gadea/auto/auto/qa_automation/auto-coder"
DEMO_REQUIREMENTS_DIR="$DEMO_DIR/demo-requirements"
DEMO_REPORTS_DIR="$DEMO_DIR/SBS_Automation/reports"

echo -e "${PURPLE}🎭 PLAYWRIGHT MCP INTEGRATION - DEMO WORKFLOW${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo -e "${BLUE}This demo showcases the complete Playwright MCP integration:${NC}"
echo -e "${CYAN}• Automated test artifact generation${NC}"
echo -e "${CYAN}• Playwright test execution via MCP${NC}"
echo -e "${CYAN}• Intelligent auto-fixing of test failures${NC}"
echo -e "${CYAN}• Comprehensive reporting and validation${NC}"
echo -e "${YELLOW}================================================================${NC}"

# Function to print step headers
print_step() {
    echo -e "\n${PURPLE}$1${NC}"
    echo -e "${YELLOW}$(printf '=%.0s' {1..60})${NC}"
}

# Function to print substeps
print_substep() {
    echo -e "${BLUE}  $1${NC}"
}

# Function to create demo requirements
create_demo_requirements() {
    print_step "📁 STEP 1: Creating Demo Requirements"
    
    # Create demo requirements directory
    mkdir -p "$DEMO_REQUIREMENTS_DIR"
    
    # Create billing invoice text requirement
    cat > "$DEMO_REQUIREMENTS_DIR/billing-invoice.txt" << 'EOF'
BILLING INVOICE MANAGEMENT FEATURE

As a billing administrator, I want to manage billing invoices so that I can track and process customer payments.

ACCEPTANCE CRITERIA:
1. Display list of billing invoices
2. Filter invoices by status (Paid, Pending, Overdue)
3. View invoice details including:
   - Invoice number
   - Customer name
   - Amount
   - Due date
   - Status
4. Mark invoice as paid
5. Send invoice reminder
6. Generate invoice report

UI ELEMENTS:
- "View Invoices" button
- "Filter by Status" dropdown
- "Invoice Details" section
- "Mark as Paid" button
- "Send Reminder" link
- "Generate Report" button
- Invoice table with columns: Number, Customer, Amount, Due Date, Status
EOF

    # Create payroll setup text requirement
    cat > "$DEMO_REQUIREMENTS_DIR/payroll-setup.txt" << 'EOF'
PAYROLL SETUP FEATURE

As an HR administrator, I want to set up payroll information so that employees can be paid correctly.

ACCEPTANCE CRITERIA:
1. Navigate to payroll setup page
2. Enter employee information:
   - Employee ID
   - Full name
   - Department
   - Position
   - Salary
   - Pay frequency
3. Set up payment methods:
   - Direct deposit
   - Bank account details
   - Routing number
4. Configure tax settings
5. Save payroll setup
6. Validate required fields

UI ELEMENTS:
- "Payroll Setup" navigation link
- "Employee Information" form section
- "Payment Methods" section
- "Tax Settings" section
- "Save Setup" button
- "Cancel" button
- Validation error messages
- Success confirmation message
EOF

    # Create company management text requirement
    cat > "$DEMO_REQUIREMENTS_DIR/company-management.txt" << 'EOF'
COMPANY MANAGEMENT DASHBOARD

As a company administrator, I want to manage company information so that I can keep all details up to date.

ACCEPTANCE CRITERIA:
1. Access company management dashboard
2. View company overview:
   - Company name
   - Address
   - Contact information
   - Number of employees
   - Subscription status
3. Edit company details
4. Manage departments:
   - Add new department
   - Edit existing department
   - View department employees
5. Configure company settings
6. View company statistics

UI ELEMENTS:
- "Company Dashboard" title
- "Edit Company" button
- "Add Department" button
- "Company Settings" link
- Company information display cards
- Department list with edit/delete actions
- Statistics charts and graphs
- "Save Changes" button
EOF

    print_substep "✅ Created billing-invoice.txt"
    print_substep "✅ Created payroll-setup.txt"
    print_substep "✅ Created company-management.txt"
}

# Function to demonstrate artifact generation
demo_artifact_generation() {
    print_step "🔧 STEP 2: Generating Test Artifacts"
    
    cd "$DEMO_DIR"
    
    print_substep "Generating billing invoice artifacts..."
    ./bin/auto-coder-enhanced generate \
        --file "$DEMO_REQUIREMENTS_DIR/billing-invoice.txt" \
        --type text \
        --domain billing \
        --validate
    
    print_substep "✅ Billing invoice artifacts generated"
    
    print_substep "Generating payroll setup artifacts..."
    ./bin/auto-coder-enhanced generate \
        --file "$DEMO_REQUIREMENTS_DIR/payroll-setup.txt" \
        --type text \
        --domain payroll \
        --validate
    
    print_substep "✅ Payroll setup artifacts generated"
    
    print_substep "Generating company management artifacts..."
    ./bin/auto-coder-enhanced generate \
        --file "$DEMO_REQUIREMENTS_DIR/company-management.txt" \
        --type text \
        --domain company \
        --validate
    
    print_substep "✅ Company management artifacts generated"
    
    echo -e "\n${GREEN}📊 Artifact Generation Summary:${NC}"
    echo -e "${CYAN}  • Features: $(find $DEMO_DIR/SBS_Automation/features -name '*.feature' 2>/dev/null | wc -l)${NC}"
    echo -e "${CYAN}  • Pages: $(find $DEMO_DIR/SBS_Automation/pages -name '*.js' 2>/dev/null | wc -l)${NC}"
    echo -e "${CYAN}  • Steps: $(find $DEMO_DIR/SBS_Automation/steps -name '*.js' 2>/dev/null | wc -l)${NC}"
}

# Function to demonstrate test execution
demo_test_execution() {
    print_step "🎭 STEP 3: Executing Playwright Tests"
    
    cd "$DEMO_DIR"
    
    print_substep "Running Playwright tests with auto-fix enabled..."
    
    # Run tests in headless mode with auto-fix
    ./bin/playwright-mcp-test \
        --headless \
        --autofix \
        --reporter html \
        --cleanup=false
    
    echo -e "\n${GREEN}🎯 Test Execution Completed${NC}"
    
    # Show test results if available
    if [ -d "$DEMO_REPORTS_DIR" ]; then
        echo -e "${CYAN}📊 Reports generated in: $DEMO_REPORTS_DIR${NC}"
        ls -la "$DEMO_REPORTS_DIR" 2>/dev/null || echo -e "${YELLOW}  No reports found yet${NC}"
    fi
}

# Function to demonstrate validation
demo_validation() {
    print_step "🔍 STEP 4: Validating Generated Artifacts"
    
    cd "$DEMO_DIR"
    
    print_substep "Running comprehensive validation with auto-fix..."
    
    ./bin/auto-coder-enhanced validate \
        --path "$DEMO_DIR/SBS_Automation" \
        --fix \
        --report
    
    print_substep "✅ Validation completed"
}

# Function to demonstrate complete workflow
demo_complete_workflow() {
    print_step "🔄 STEP 5: Complete Workflow Demonstration"
    
    cd "$DEMO_DIR"
    
    print_substep "Running complete workflow for a new requirement..."
    
    # Create a simple new requirement
    cat > "$DEMO_REQUIREMENTS_DIR/employee-dashboard.txt" << 'EOF'
EMPLOYEE DASHBOARD

As an employee, I want to view my dashboard so that I can see my personal information and recent activities.

ACCEPTANCE CRITERIA:
1. Display employee name and photo
2. Show recent time entries
3. Display upcoming events
4. View notifications
5. Access quick actions menu

UI ELEMENTS:
- "Welcome [Employee Name]" title
- Employee photo
- "Recent Activities" section
- "Upcoming Events" section
- "Notifications" badge
- "Quick Actions" menu
EOF

    print_substep "Executing complete workflow: generate → test → validate..."
    
    ./bin/auto-coder-enhanced workflow \
        --file "$DEMO_REQUIREMENTS_DIR/employee-dashboard.txt" \
        --type text \
        --domain people \
        --headless \
        --skip_deploy
    
    print_substep "✅ Complete workflow demonstrated"
}

# Function to show interactive mode
demo_interactive_mode() {
    print_step "🎨 STEP 6: Interactive Mode Demonstration"
    
    echo -e "${BLUE}The enhanced CLI also supports interactive mode for guided workflows.${NC}"
    echo -e "${CYAN}To start interactive mode, run:${NC}"
    echo -e "${YELLOW}  ./bin/auto-coder-enhanced interactive${NC}"
    echo -e "${CYAN}Or simply:${NC}"
    echo -e "${YELLOW}  ./bin/auto-coder-enhanced${NC}"
    
    print_substep "Interactive mode features:"
    echo -e "${CYAN}  • Guided artifact generation${NC}"
    echo -e "${CYAN}  • Step-by-step test execution${NC}"
    echo -e "${CYAN}  • Deployment assistance${NC}"
    echo -e "${CYAN}  • Validation and cleanup tools${NC}"
    echo -e "${CYAN}  • Report viewing${NC}"
}

# Function to show reports and results
show_results() {
    print_step "📊 STEP 7: Results and Reports"
    
    echo -e "${BLUE}Generated artifacts can be found in:${NC}"
    echo -e "${CYAN}  • Features: $DEMO_DIR/SBS_Automation/features/${NC}"
    echo -e "${CYAN}  • Pages: $DEMO_DIR/SBS_Automation/pages/${NC}"
    echo -e "${CYAN}  • Steps: $DEMO_DIR/SBS_Automation/steps/${NC}"
    
    if [ -d "$DEMO_REPORTS_DIR" ]; then
        echo -e "\n${BLUE}Generated reports:${NC}"
        find "$DEMO_REPORTS_DIR" -name "*.html" -o -name "*.json" 2>/dev/null | head -5 | while read report; do
            echo -e "${CYAN}  • $(basename "$report")${NC}"
        done
    fi
    
    echo -e "\n${BLUE}MCP Configuration:${NC}"
    echo -e "${CYAN}  • MCP Config: $DEMO_DIR/config/playwright-mcp.json${NC}"
    echo -e "${CYAN}  • VS Code MCP: /Users/gadea/auto/auto/qa_automation/.vscode/mcp.json${NC}"
    
    echo -e "\n${BLUE}Available commands:${NC}"
    echo -e "${CYAN}  • Enhanced CLI: ./bin/auto-coder-enhanced${NC}"
    echo -e "${CYAN}  • Playwright MCP: ./bin/playwright-mcp-test${NC}"
    echo -e "${CYAN}  • Help: ./bin/auto-coder-enhanced help${NC}"
}

# Function to cleanup demo artifacts
cleanup_demo() {
    print_step "🧹 CLEANUP: Removing Demo Artifacts"
    
    echo -e "${YELLOW}Do you want to clean up demo artifacts? (y/N):${NC}"
    read -r cleanup_choice
    
    if [[ "$cleanup_choice" =~ ^[Yy]$ ]]; then
        cd "$DEMO_DIR"
        
        print_substep "Cleaning up demo requirements..."
        rm -rf "$DEMO_REQUIREMENTS_DIR"
        
        print_substep "Cleaning up generated artifacts..."
        ./bin/auto-coder-enhanced cleanup --all --backup
        
        print_substep "✅ Demo cleanup completed"
    else
        print_substep "Demo artifacts preserved for inspection"
    fi
}

# Main demo execution
main() {
    echo -e "${GREEN}Starting Playwright MCP Integration Demo...${NC}\n"
    
    # Check if we're in the right directory
    if [ ! -f "$DEMO_DIR/bin/auto-coder-enhanced" ]; then
        echo -e "${RED}❌ Demo script must be run from the correct directory${NC}"
        echo -e "${YELLOW}Expected: $DEMO_DIR${NC}"
        exit 1
    fi
    
    # Make sure scripts are executable
    chmod +x "$DEMO_DIR/bin/"*
    
    # Run demo steps
    create_demo_requirements
    demo_artifact_generation
    demo_test_execution
    demo_validation
    demo_complete_workflow
    demo_interactive_mode
    show_results
    
    echo -e "\n${PURPLE}🎉 DEMO COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}The Playwright MCP integration is now ready for use.${NC}"
    echo -e "${BLUE}Check the generated reports and artifacts for detailed results.${NC}"
    
    cleanup_demo
    
    echo -e "\n${CYAN}For more information, see:${NC}"
    echo -e "${YELLOW}  ./docs/PLAYWRIGHT-MCP-INTEGRATION.md${NC}"
    echo -e "${CYAN}To get started with real requirements:${NC}"
    echo -e "${YELLOW}  ./bin/auto-coder-enhanced interactive${NC}"
}

# Run the demo
main "$@"
