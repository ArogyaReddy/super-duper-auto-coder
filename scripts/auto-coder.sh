#!/bin/bash

# Auto-Coder - Main Script
# Version: 1.0.0
# Description: Generate and run test artifacts from various input sources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COMMAND=""
INPUT_FILE=""
FRAMEWORK_ROOT=$(dirname "$(realpath "$0")")

# Function to display usage
show_usage() {
    echo -e "${BLUE}Auto-Coder - Usage${NC}"
    echo ""
    echo "Usage: $0 <command> [input_file]"
    echo ""
    echo "Commands:"
    echo "  generate <input_file>  - Generate test artifacts from input file"
    echo "  run <test_file>       - Run generated test artifacts"
    echo "  test <test_file>      - Run generated test artifacts (alias for run)"
    echo "  interactive           - Launch interactive CLI"
    echo "  help                  - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 generate requirements/text/requirement.txt"
    echo "  $0 run generated/tests/requirement-test.js"
    echo "  $0 interactive"
    echo ""
}

# Function to generate test artifacts
generate_artifacts() {
    local input_file="$1"
    
    if [[ ! -f "$input_file" ]]; then
        echo -e "${RED}Error: Input file '$input_file' not found${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Generating test artifacts from: $input_file${NC}"
    
    # Run the main generation script
    cd "$FRAMEWORK_ROOT"
    node index.js "$input_file"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Test artifacts generated successfully!${NC}"
    else
        echo -e "${RED}Error generating test artifacts${NC}"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    local test_file="$1"
    
    if [[ ! -f "$test_file" ]]; then
        echo -e "${RED}Error: Test file '$test_file' not found${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}Running tests: $test_file${NC}"
    echo -e "${YELLOW}Note: Tests are expected to fail initially due to placeholder locators${NC}"
    echo -e "${YELLOW}This indicates the framework generated real tests, not mocks${NC}"
    
    cd "$FRAMEWORK_ROOT"
    
    # Create report directories if they don't exist
    mkdir -p generated/reports/custom
    mkdir -p generated/reports/html-report
    mkdir -p generated/reports/artifacts
    
    # Determine test type and run appropriately
    if [[ "$test_file" == *.feature ]]; then
        # Run Cucumber feature file
        echo -e "${BLUE}Running Cucumber BDD test...${NC}"
        npx cucumber-js "$test_file" --require ./generated/steps --require ./support/hooks.js --format progress --format json:generated/reports/cucumber-results.json
    elif [[ "$test_file" == *-test.js ]]; then
        # Run Playwright test file with enhanced reporting
        echo -e "${BLUE}Running Playwright test with detailed reporting...${NC}"
        
        # Set environment variables for enhanced reporting
        # export PW_TEST_HTML_REPORT_OPEN=never
        export PW_TEST_HTML_REPORT_OPEN=always
        export PW_TEST_SCREENSHOT=only-on-failure
        export PW_TEST_VIDEO=retain-on-failure
        
        # Run with single browser (chromium) and enhanced reporting
        npx playwright test "$test_file" --project=chromium --reporter=html,json,list,./support/custom-reporter.js
        
        # Copy HTML report to accessible location and don't auto-serve
        if [[ -d "generated/reports/playwright-report" ]]; then
            echo -e "${GREEN}Playwright HTML report saved to: generated/reports/playwright-report/index.html${NC}"
            echo -e "${GREEN}Custom detailed report: generated/reports/custom/detailed-test-report.html${NC}"
            echo -e "${BLUE}You can open these reports in your browser manually${NC}"
        fi
        
    else
        # Default to running with node
        echo -e "${BLUE}Running with Node.js...${NC}"
        node "$test_file"
    fi
    
    # Generate summary of results
    echo -e "\n${BLUE}=== Test Execution Summary ===${NC}"
    if [[ -f "generated/reports/custom/detailed-results.json" ]]; then
        echo -e "${GREEN}✅ Detailed reports generated successfully${NC}"
        echo -e "${YELLOW}📊 View reports:${NC}"
        echo -e "   🌐 Playwright HTML Report: file://$PWD/generated/reports/playwright-report/index.html"
        echo -e "   📋 Detailed Custom Report: file://$PWD/generated/reports/custom/detailed-test-report.html"
        echo -e "   📄 JSON Report: $PWD/generated/reports/custom/detailed-results.json"
        
        # Show quick summary from JSON
        if command -v jq >/dev/null 2>&1; then
            echo -e "\n${YELLOW}Quick Summary:${NC}"
            jq -r '.summary | "Total: \(.total), Passed: \(.passed), Failed: \(.failed)"' generated/reports/custom/detailed-results.json
        fi
    fi
    
    # Always show the expected behavior notice
    echo -e "\n${YELLOW}💡 Expected Behavior Notice:${NC}"
    echo -e "   Tests are designed to fail initially with placeholder locators"
    echo -e "   This confirms real tests were generated (not mocks)"
    echo -e "   Update locators in page files with real application selectors"
    echo -e "   See detailed report for specific locator issues and recommendations"
    
    if [[ $? -eq 0 ]]; then
        echo -e "\n${GREEN}Tests execution completed successfully!${NC}"
    else
        echo -e "\n${YELLOW}Tests completed with expected failures (placeholder locators)${NC}"
        echo -e "${BLUE}This is normal behavior for generated test artifacts${NC}"
    fi
}

# Function to launch interactive CLI
launch_interactive() {
    echo -e "${BLUE}Launching Interactive CLI...${NC}"
    cd "$FRAMEWORK_ROOT"
    
    # Check if interactive CLI file exists
    if [[ -f "interactive-cli.js" ]]; then
        node interactive-cli.js
    elif [[ -f "index.js" ]]; then
        # Use index.js with interactive flag
        node index.js --interactive
    else
        echo -e "${RED}Error: No interactive CLI found${NC}"
        echo -e "${YELLOW}Available options:${NC}"
        echo -e "  1. Generate test artifacts: ./auto-coder.sh generate <input_file>"
        echo -e "  2. Run tests: ./auto-coder.sh test <test_file>"
        echo -e "  3. View help: ./auto-coder.sh help"
        exit 1
    fi
}

# Main script logic
case "$1" in
    "generate")
        if [[ -z "$2" ]]; then
            echo -e "${RED}Error: Input file required for generate command${NC}"
            show_usage
            exit 1
        fi
        generate_artifacts "$2"
        ;;
    "run")
        if [[ -z "$2" ]]; then
            echo -e "${RED}Error: Test file required for run command${NC}"
            show_usage
            exit 1
        fi
        run_tests "$2"
        ;;
    "test")
        if [[ -z "$2" ]]; then
            echo -e "${RED}Error: Test file required for test command${NC}"
            show_usage
            exit 1
        fi
        run_tests "$2"
        ;;
    "interactive")
        launch_interactive
        ;;
    "help" | "--help" | "-h")
        show_usage
        ;;
    "")
        echo -e "${RED}Error: Command required${NC}"
        show_usage
        exit 1
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$1'${NC}"
        show_usage
        exit 1
        ;;
esac