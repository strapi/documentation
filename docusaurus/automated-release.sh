#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;94m'
YELLOW='\033[1;33m'
NC='\033[0m'

REPO="strapi/documentation"
TEMP_DIR="/tmp/release-automation-$$"
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

# Function to make GitHub API DELETE requests
gh_api_delete() {
    local endpoint="$1"
    curl -s -X DELETE \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO/$endpoint"
}

# Function to check if release already exists
check_existing_release() {
    echo -e "${BLUE}🔍 Checking if release already exists...${NC}"
    
    local existing_release=$(gh_api_get "releases/tags/v$MILESTONE_TITLE")
    
    if echo "$existing_release" | jq -e '.id' > /dev/null 2>&1; then
        local release_url=$(echo "$existing_release" | jq -r '.html_url')
        echo -e "${YELLOW}⚠️  Release v$MILESTONE_TITLE already exists!${NC}"
        echo -e "${BLUE}Existing release: $release_url${NC}"
        echo ""
        
        echo -n "What would you like to do? "
        echo -e "${BLUE}(o)verwrite existing release, (n)ext milestone, (c)ancel${NC}: "
        read -r choice
        
        case "$choice" in
            [Oo]*)
                echo -e "${YELLOW}Will overwrite existing release${NC}"
                OVERWRITE_RELEASE=true
                ;;
            [Nn]*)
                echo -e "${BLUE}Moving to next milestone...${NC}"
                find_next_milestone
                ;;
            [Cc]*|*)
                echo -e "${RED}❌ Release cancelled${NC}"
                exit 0
                ;;
        esac
    else
        echo -e "${GREEN}✅ No existing release found${NC}"
        OVERWRITE_RELEASE=false
    fi
}

# Function to find next milestone
find_next_milestone() {
    local next_version=$(echo "$MILESTONE_TITLE" | awk -F. '{$NF = $NF + 1; print}' OFS='.')
    echo -e "${BLUE}Looking for next milestone: $next_version${NC}"
    
    local milestones=$(gh_api_get "milestones?state=open")
    local next_milestone=$(echo "$milestones" | jq -r --arg version "$next_version" '.[] | select(.title == $version)')
    
    if [ -z "$next_milestone" ] || [ "$next_milestone" = "null" ]; then
        echo -e "${YELLOW}⚠️  Calculated next milestone ($next_version) not found${NC}"
        echo -e "${BLUE}This might be a version jump (e.g., 6.9.x → 6.10.0 or 7.0.0)${NC}"
        echo ""
        echo -e "${BLUE}Available open milestones:${NC}"
        
        # Display milestones in a more readable format with numbers for selection
        local milestone_list=""
        local counter=1
        while IFS= read -r milestone; do
            local title=$(echo "$milestone" | jq -r '.title')
            local due_date=$(echo "$milestone" | jq -r '.due_on // "no due date"')
            echo -e "${BLUE}$counter) $title${NC} (due: $due_date)"
            milestone_list="$milestone_list$counter:$(echo "$milestone" | jq -r '.number'):$title\n"
            counter=$((counter + 1))
        done <<< "$(echo "$milestones" | jq -c '.[]')"
        
        echo ""
        echo -n "Select milestone number (1-$((counter-1))): "
        read -r selection
        
        # Validate selection
        if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt $((counter-1)) ]; then
            echo -e "${RED}❌ Invalid selection${NC}"
            exit 1
        fi
        
        # Extract milestone info from our list
        local selected_info=$(echo -e "$milestone_list" | sed -n "${selection}p")
        local selected_number=$(echo "$selected_info" | cut -d':' -f2)
        local selected_title=$(echo "$selected_info" | cut -d':' -f3)
        
        MILESTONE_NUMBER="$selected_number"
        MILESTONE_TITLE="$selected_title"
        echo -e "${GREEN}✅ Selected milestone: $MILESTONE_TITLE (ID: $MILESTONE_NUMBER)${NC}"
    else
        MILESTONE_NUMBER=$(echo "$next_milestone" | jq -r '.number')
        MILESTONE_TITLE=$(echo "$next_milestone" | jq -r '.title')
        echo -e "${GREEN}✅ Found next milestone: $MILESTONE_TITLE (ID: $MILESTONE_NUMBER)${NC}"
    fi
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
    
    echo "Calling release notes script for milestone $MILESTONE_NUMBER ($MILESTONE_TITLE)..."
    
    # The release notes script has an interactive milestone selection with arrow keys
    # We need to simulate the exact keypresses to select our milestone
    # Since the script sorts milestones by creation date (desc), we need to find the position
    
    local milestones=$(gh_api_get "milestones?state=open&sort=created&direction=desc")
    local milestone_position=0
    local found=false
    
    # Find the position of our target milestone in the list
    while read -r line; do
        milestone_position=$((milestone_position + 1))
        milestone_num=$(echo "$line" | cut -d')' -f1)
        if [ "$milestone_num" = "$MILESTONE_NUMBER" ]; then
            found=true
            break
        fi
    done <<< "$(echo "$milestones" | jq -r '.[] | "\(.number)) \(.title)"')"
    
    if [ "$found" = false ]; then
        echo -e "${RED}❌ Could not find milestone $MILESTONE_NUMBER in the list${NC}"
        exit 1
    fi
    
    echo "Found milestone at position $milestone_position"
    
    # Generate the arrow key presses needed to reach our milestone
    # Position 1 = already selected (no arrows needed)
    # Position 2 = 1 down arrow, etc.
    local arrows=""
    for ((i=1; i<milestone_position; i++)); do
        arrows="${arrows}$(printf '\033[B')"  # Down arrow
    done
    
    # Create response file with the right arrow key sequence
    cat > "$TEMP_DIR/responses.txt" << EOF
N
${arrows}

EOF
    
    # Run the script with predefined responses
    "$RELEASE_SCRIPT_PATH" < "$TEMP_DIR/responses.txt"
    
    if [ ! -f "$TEMP_RELEASE_NOTES" ]; then
        echo -e "${RED}❌ Failed to generate release notes${NC}"
        echo -e "${BLUE}Expected file: $TEMP_RELEASE_NOTES${NC}"
        echo -e "${BLUE}Files in docs directory:${NC}"
        ls -la docs/temp* 2>/dev/null || echo "No temp files found"
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
    
    # We should already be on main branch (checked at script start)
    echo -e "${BLUE}Confirming we're on main branch...${NC}"
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        echo -e "${RED}❌ Unexpected branch change. Currently on: $current_branch${NC}"
        exit 1
    fi
    
    # Pull latest changes to avoid conflicts
    echo -e "${BLUE}Pulling latest changes...${NC}"
    git pull origin main
    
    # Check if there are changes
    if ! git diff --quiet; then
        git add "$PACKAGE_JSON_FILE" "$RELEASE_NOTES_FILE"
        git commit -m "v$MILESTONE_TITLE"
        
        echo -e "${BLUE}Pushing to main branch...${NC}"
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Changes committed and pushed${NC}"
        else
            echo -e "${RED}❌ Failed to push changes${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    echo -e "${BLUE}⏳ Waiting for deployment...${NC}"
    
    # Wait a minimum of 2 minutes before checking
    echo -e "${BLUE}Waiting initial 2 minutes for build to start...${NC}"
    sleep 120
    
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${BLUE}Attempt $attempt/$max_attempts - Checking deployment status...${NC}"
        
        # Check if the new version is live by checking the release notes page
        local version_anchor=$(echo "$MILESTONE_TITLE" | sed 's/\.//g')
        local check_url="https://docs.strapi.io/release-notes#$version_anchor"
        
        # More robust check: look for the actual version number in the page content
        if curl -s "$check_url" | grep -q "$MILESTONE_TITLE"; then
            echo -e "${GREEN}✅ Deployment appears to be live - found version $MILESTONE_TITLE on the page${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Deployment not ready yet, waiting 45 seconds...${NC}"
        sleep 45
        ((attempt++))
    done
    
    echo -e "${YELLOW}⚠️  Deployment check timed out after $((max_attempts * 45 / 60 + 2)) minutes${NC}"
    echo -n "Do you want to continue with release creation anyway? (y/N) "
    read -r continue_release
    if [[ ! "$continue_release" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Release creation cancelled${NC}"
        exit 1
    fi
}

# Function to create GitHub release
create_github_release() {
    echo -e "${BLUE}🚀 Creating GitHub release...${NC}"
    
    local version_anchor=$(echo "$MILESTONE_TITLE" | sed 's/\.//g')
    local release_body="Full release notes for v$MILESTONE_TITLE are available [directly on the website](https://docs.strapi.io/release-notes#$version_anchor).

Thank you to all contributors! 🫶 (you're listed on docs.strapi.io 👀)"
    
    if [ "$OVERWRITE_RELEASE" = true ]; then
        # Delete existing release first
        echo -e "${BLUE}Deleting existing release...${NC}"
        gh_api_delete "releases/tags/v$MILESTONE_TITLE"
        
        # Also delete the tag to avoid conflicts
        git tag -d "v$MILESTONE_TITLE" 2>/dev/null || true
        git push origin --delete "v$MILESTONE_TITLE" 2>/dev/null || true
    fi
    
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
    
    # Clean up backup files since everything succeeded
    echo -e "${BLUE}🧹 Cleaning up backup files...${NC}"
    if [ -f "$PACKAGE_JSON_FILE.bak" ]; then
        rm -f "$PACKAGE_JSON_FILE.bak"
        echo -e "${GREEN}✅ Removed $PACKAGE_JSON_FILE.bak${NC}"
    fi
    if [ -f "$RELEASE_NOTES_FILE.bak" ]; then
        rm -f "$RELEASE_NOTES_FILE.bak"
        echo -e "${GREEN}✅ Removed $RELEASE_NOTES_FILE.bak${NC}"
    fi
    echo ""
}

# Main function
main() {
    setup_github_auth
    find_today_milestone
    check_existing_release
    
    echo ""
    echo -e "${BLUE}📋 Release Summary:${NC}"
    echo -e "- Milestone: $MILESTONE_TITLE"
    echo -e "- Repository: $REPO"
    if [ "$OVERWRITE_RELEASE" = true ]; then
        echo -e "- Mode: Overwriting existing release"
    fi
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

# Check if we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${RED}❌ You must run this script from the 'main' branch${NC}"
    echo -e "${BLUE}Current branch: $current_branch${NC}"
    echo ""
    echo -e "${YELLOW}Please:${NC}"
    echo -e "1. Save/commit your current work: ${BLUE}git add . && git commit -m 'WIP: save work'${NC}"
    echo -e "2. Switch to main branch: ${BLUE}git checkout main${NC}"
    echo -e "3. Pull latest changes: ${BLUE}git pull origin main${NC}"
    echo -e "4. Run this script again"
    echo ""
    exit 1
fi

# Configure git to avoid pull strategy warnings
git config pull.rebase false 2>/dev/null || true

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