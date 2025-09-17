#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO="strapi/documentation"
TEMP_DIR="/tmp/release-automation-$"
RELEASE_NOTES_FILE="docs/release-notes.md"
PACKAGE_JSON_FILE="package.json"
TEMP_RELEASE_NOTES="docs/temp-new-release-notes.md"

# Create temporary directory at the start
mkdir -p "$TEMP_DIR"

# Make sure to clean up temp directory on exit
trap 'rm -rf "$TEMP_DIR"' EXIT

echo -e "${BLUE}🚀 Automated Release Process for Strapi Documentation${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# GitHub Configuration
setup_github_auth() {
    if [ -z "$GITHUB_TOKEN" ]; then
        if [ -f ~/.github_token ]; then
            GITHUB_TOKEN=$(cat ~/.github_token)
        else
            echo -e "${BLUE}No GitHub token found.${NC}"
            echo -e "Please create a token at https://github.com/settings/tokens"
            echo -n "Enter your GitHub token: "
            read -r GITHUB_TOKEN
            echo -n "Do you want to save this token for later use? (y/N) "
            read -r save_token
            if [[ "$save_token" =~ ^[Yy]$ ]]; then
                echo "$GITHUB_TOKEN" > ~/.github_token
                chmod 600 ~/.github_token
                echo -e "${GREEN}Token saved in ~/.github_token${NC}"
            fi
        fi
    fi
}

# Function to make GitHub API requests
gh_api_get() {
    local endpoint="$1"
    curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/$endpoint"
}

# Function to make GitHub API POST requests
gh_api_post() {
    local endpoint="$1"
    local data="$2"
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "https://api.github.com/repos/$REPO/$endpoint"
}

# Function to make GitHub API PATCH requests
gh_api_patch() {
    local endpoint="$1"
    local data="$2"
    curl -s -X PATCH \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$data" \
        "https://api.github.com/repos/$REPO/$endpoint"
}

# Function to find today's milestone
find_today_milestone() {
    local today=$(date -u +%Y-%m-%d)
    echo -e "${BLUE}🔍 Looking for milestone due today ($today)...${NC}"
    
    local milestones=$(gh_api_get "milestones?state=open")
    
    # Find milestone with today's due date
    local today_milestone=$(echo "$milestones" | jq -r --arg today "$today" '.[] | select(.due_on != null and (.due_on | strptime("%Y-%m-%dT%H:%M:%SZ") | strftime("%Y-%m-%d")) == $today)')
    
    if [ -z "$today_milestone" ] || [ "$today_milestone" = "null" ]; then
        echo -e "${YELLOW}⚠️  No milestone found with due date today${NC}"
        echo -e "${BLUE}Available open milestones:${NC}"
        echo "$milestones" | jq -r '.[] | "- \(.title) (due: \(.due_on // "no due date"))"'
        
        echo ""
        echo -n "Do you want to select a milestone manually? (y/N) "
        read -r manual_select
        if [[ "$manual_select" =~ ^[Yy]$ ]]; then
            select_milestone_manually "$milestones"
        else
            echo -e "${RED}❌ No milestone selected. Exiting.${NC}"
            exit 1
        fi
    else
        MILESTONE_NUMBER=$(echo "$today_milestone" | jq -r '.number')
        MILESTONE_TITLE=$(echo "$today_milestone" | jq -r '.title')
        echo -e "${GREEN}✅ Found milestone: $MILESTONE_TITLE (ID: $MILESTONE_NUMBER)${NC}"
    fi
}

# Function to manually select milestone
select_milestone_manually() {
    local milestones="$1"
    
    echo "$milestones" | jq -r '.[] | "\(.number)) \(.title) (due: \(.due_on // "no due date"))"' > "$TEMP_DIR/milestones.txt"
    
    echo -e "${BLUE}Select a milestone:${NC}"
    cat "$TEMP_DIR/milestones.txt"
    
    echo -n "Enter milestone number: "
    read -r selected_number
    
    local selected_milestone=$(echo "$milestones" | jq -r --arg num "$selected_number" '.[] | select(.number == ($num | tonumber))')
    
    if [ -z "$selected_milestone" ] || [ "$selected_milestone" = "null" ]; then
        echo -e "${RED}❌ Invalid milestone number${NC}"
        exit 1
    fi
    
    MILESTONE_NUMBER=$(echo "$selected_milestone" | jq -r '.number')
    MILESTONE_TITLE=$(echo "$selected_milestone" | jq -r '.title')
    echo -e "${GREEN}✅ Selected milestone: $MILESTONE_TITLE (ID: $MILESTONE_NUMBER)${NC}"
}

# Function to check pending PRs
check_pending_prs() {
    echo -e "${BLUE}🔍 Checking for pending PRs in milestone...${NC}"
    
    local prs=$(gh_api_get "issues?milestone=$MILESTONE_NUMBER&state=open")
    
    # Filter only pull requests (items with pull_request field)
    local pending_prs=$(echo "$prs" | jq '[.[] | select(.pull_request != null)]')
    
    if [ "$(echo "$pending_prs" | jq 'length')" -eq 0 ]; then
        echo -e "${GREEN}✅ No pending PRs found${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  Found pending PRs:${NC}"
    echo "$pending_prs" | jq -r '.[] | "- #\(.number): \(.title)"'
    
    # Check for problematic flags
    local problematic_prs=$(echo "$pending_prs" | jq '[.[] | select(.labels[] | .name | test("flag: merge pending release|flag: don'\''t merge"))]')
    
    if [ "$(echo "$problematic_prs" | jq 'length')" -gt 0 ]; then
        echo -e "${RED}❌ Found PRs with blocking flags:${NC}"
        echo "$problematic_prs" | jq -r '.[] | "- #\(.number): \(.title) [" + ([.labels[] | .name | select(test("flag:"))] | join(", ")) + "]"'
        
        echo ""
        echo -n "Do you want to move these PRs to the next milestone and continue? (y/N) "
        read -r move_prs
        if [[ "$move_prs" =~ ^[Yy]$ ]]; then
            move_problematic_prs "$problematic_prs"
        else
            echo -e "${RED}❌ Please resolve the PRs manually first${NC}"
            exit 1
        fi
    else
        echo ""
        echo -n "There are pending PRs but no blocking flags. Continue anyway? (y/N) "
        read -r continue_anyway
        if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Release cancelled${NC}"
            exit 1
        fi
    fi
}

# Function to move problematic PRs to next milestone
move_problematic_prs() {
    local problematic_prs="$1"
    
    # Find next milestone (assuming sequential numbering)
    local next_version=$(echo "$MILESTONE_TITLE" | awk -F. '{$NF = $NF + 1; print}' OFS='.')
    local next_milestone=$(gh_api_get "milestones?state=open" | jq -r --arg version "$next_version" '.[] | select(.title == $version)')
    
    if [ -z "$next_milestone" ] || [ "$next_milestone" = "null" ]; then
        echo -e "${YELLOW}⚠️  Next milestone ($next_version) not found. You'll need to move PRs manually.${NC}"
        return 1
    fi
    
    local next_milestone_number=$(echo "$next_milestone" | jq -r '.number')
    
    echo "$problematic_prs" | jq -r '.[].number' | while read -r pr_number; do
        echo -e "${BLUE}Moving PR #$pr_number to next milestone...${NC}"
        gh_api_patch "issues/$pr_number" "{\"milestone\": $next_milestone_number}"
    done
    
    echo -e "${GREEN}✅ Problematic PRs moved to next milestone${NC}"
}

# Function to update package.json version
update_package_version() {
    echo -e "${BLUE}📝 Updating package.json version...${NC}"
    
    # Create backup
    cp "$PACKAGE_JSON_FILE" "$PACKAGE_JSON_FILE.bak"
    
    # Update version using jq
    jq --arg version "$MILESTONE_TITLE" '.version = $version' "$PACKAGE_JSON_FILE" > "$TEMP_DIR/package.json.tmp"
    mv "$TEMP_DIR/package.json.tmp" "$PACKAGE_JSON_FILE"
    
    echo -e "${GREEN}✅ Updated package.json version to $MILESTONE_TITLE${NC}"
}

# Function to generate release notes
generate_release_notes() {
    echo -e "${BLUE}📋 Generating release notes...${NC}"
    
    # Use existing release notes script logic but automatically
    export MILESTONE_NUMBER
    export MILESTONE_TITLE
    
    # Run the existing script logic (adapted)
    $RELEASE_SCRIPT_PATH --auto --milestone "$MILESTONE_NUMBER"
    
    if [ ! -f "$TEMP_RELEASE_NOTES" ]; then
        echo -e "${RED}❌ Failed to generate release notes${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Release notes generated${NC}"
}

# Function to integrate release notes
integrate_release_notes() {
    echo -e "${BLUE}📄 Integrating release notes into main file...${NC}"
    
    if [ ! -f "$RELEASE_NOTES_FILE" ]; then
        echo -e "${RED}❌ Release notes file not found: $RELEASE_NOTES_FILE${NC}"
        exit 1
    fi
    
    # Create backup
    cp "$RELEASE_NOTES_FILE" "$RELEASE_NOTES_FILE.bak"
    
    # Insert new release notes after line 29
    head -n 29 "$RELEASE_NOTES_FILE" > "$TEMP_DIR/release_notes_temp.md"
    echo "" >> "$TEMP_DIR/release_notes_temp.md"
    cat "$TEMP_RELEASE_NOTES" >> "$TEMP_DIR/release_notes_temp.md"
    echo "" >> "$TEMP_DIR/release_notes_temp.md"
    tail -n +30 "$RELEASE_NOTES_FILE" >> "$TEMP_DIR/release_notes_temp.md"
    
    mv "$TEMP_DIR/release_notes_temp.md" "$RELEASE_NOTES_FILE"
    rm -f "$TEMP_RELEASE_NOTES"
    
    echo -e "${GREEN}✅ Release notes integrated${NC}"
}

# Function to commit and push changes
commit_and_push() {
    echo -e "${BLUE}💾 Committing and pushing changes...${NC}"
    
    # Check if there are changes
    if ! git diff --quiet; then
        git add "$PACKAGE_JSON_FILE" "$RELEASE_NOTES_FILE"
        git commit -m "v$MILESTONE_TITLE"
        
        echo -e "${BLUE}Pushing to main branch...${NC}"
        git push origin main
        
        echo -e "${GREEN}✅ Changes committed and pushed${NC}"
    else
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    echo -e "${BLUE}⏳ Waiting for deployment...${NC}"
    
    local max_attempts=20
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}Attempt $attempt/$max_attempts - Checking deployment status...${NC}"
        
        # Check if the new version is live by checking the release notes page
        local version_anchor=$(echo "$MILESTONE_TITLE" | sed 's/\.//g')
        local check_url="https://docs.strapi.io/release-notes#$version_anchor"
        
        if curl -s --head "$check_url" | head -n 1 | grep -q "200 OK"; then
            echo -e "${GREEN}✅ Deployment appears to be live${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Deployment not ready yet, waiting 30 seconds...${NC}"
        sleep 30
        ((attempt++))
    done
    
    echo -e "${YELLOW}⚠️  Deployment check timed out, but continuing with release creation${NC}"
}

# Function to create GitHub release
create_github_release() {
    echo -e "${BLUE}🚀 Creating GitHub release...${NC}"
    
    local version_anchor=$(echo "$MILESTONE_TITLE" | sed 's/\.//g')
    local release_body="Full release notes for v$MILESTONE_TITLE are available [directly on the website](https://docs.strapi.io/release-notes#$version_anchor).

Thank you to all contributors! 🫶 (you're listed on docs.strapi.io 👀)"
    
    local release_data=$(jq -n \
        --arg tag "v$MILESTONE_TITLE" \
        --arg name "v$MILESTONE_TITLE" \
        --arg body "$release_body" \
        '{
            tag_name: $tag,
            name: $name,
            body: $body,
            draft: false,
            prerelease: false
        }')
    
    local response=$(gh_api_post "releases" "$release_data")
    
    if echo "$response" | jq -e '.id' > /dev/null; then
        local release_url=$(echo "$response" | jq -r '.html_url')
        echo -e "${GREEN}✅ GitHub release created: $release_url${NC}"
    else
        echo -e "${RED}❌ Failed to create GitHub release${NC}"
        echo "Response: $response"
        exit 1
    fi
}

# Function to show summary
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 Release Process Completed Successfully!${NC}"
    echo -e "${GREEN}=======================================${NC}"
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo -e "- ✅ Milestone: $MILESTONE_TITLE"
    echo -e "- ✅ Package.json updated"
    echo -e "- ✅ Release notes generated and integrated"
    echo -e "- ✅ Changes committed and pushed"
    echo -e "- ✅ GitHub release created"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "- Check the live documentation: https://docs.strapi.io/release-notes"
    echo -e "- Verify the GitHub release: https://github.com/strapi/documentation/releases/tag/v$MILESTONE_TITLE"
    echo ""
}

# Main function
main() {
    setup_github_auth
    find_today_milestone
    
    echo ""
    echo -e "${BLUE}📋 Release Summary:${NC}"
    echo -e "- Milestone: $MILESTONE_TITLE"
    echo -e "- Repository: $REPO"
    echo ""
    
    echo -n "Do you want to proceed with the automated release? (y/N) "
    read -r proceed
    if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Release cancelled by user${NC}"
        exit 0
    fi
    
    check_pending_prs
    update_package_version
    generate_release_notes
    integrate_release_notes
    commit_and_push
    wait_for_deployment
    create_github_release
    show_summary
}

# Check if we're in the right directory (should be in docusaurus/ folder)
if [ ! -f "$PACKAGE_JSON_FILE" ]; then
    echo -e "${RED}❌ package.json not found.${NC}"
    echo -e "${BLUE}This script should be run from the docusaurus/ directory.${NC}"
    echo -e "${BLUE}Current directory: $(pwd)${NC}"
    
    if [ -f "../$PACKAGE_JSON_FILE" ]; then
        echo -e "${BLUE}Found package.json in parent directory. Changing to correct directory...${NC}"
        cd ..
    elif [ -f "docusaurus/$PACKAGE_JSON_FILE" ]; then
        echo -e "${BLUE}Found package.json in docusaurus/ subdirectory. Changing to correct directory...${NC}"
        cd docusaurus
    else
        echo -e "${RED}❌ Could not locate package.json. Please navigate to the docusaurus/ directory and run again.${NC}"
        exit 1
    fi
fi

# Check if release notes script exists
if [ ! -f "release-notes-script.sh" ]; then
    echo -e "${RED}❌ Release notes script not found: release-notes-script.sh${NC}"
    echo -e "${BLUE}Current directory: $(pwd)${NC}"
    echo -e "${BLUE}Files in current directory:${NC}"
    ls -la *.sh 2>/dev/null || echo "No .sh files found"
    exit 1
fi

RELEASE_SCRIPT_PATH="./release-notes-script.sh"
echo -e "${GREEN}✅ Found release script: $RELEASE_SCRIPT_PATH${NC}"

main "$@"