#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO="strapi/documentation"
OUTPUT_DIR="docs"
OUTPUT_FILE="$OUTPUT_DIR/temp-new-release-notes.md"
TEMP_DIR="/tmp/release-notes-$$"

# Create temporary directory at the start
mkdir -p "$TEMP_DIR"

# Make sure to clean up temp directory on exit
trap 'rm -rf "$TEMP_DIR"' EXIT

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

# Function to select a milestone
select_milestone() {
    # Ask about including closed milestones
    milestone_state="open"  # Default to open
    echo -e "${BLUE}Do you want to include closed milestones? (y/N)${NC}"
    read -r include_closed
    # Only change if explicitly answered yes
    if [[ "$include_closed" =~ ^[Yy]$ ]]; then
        milestone_state="all"
    fi

    echo -e "${BLUE}Fetching milestones...${NC}"
    milestones=$(gh_api_get "milestones?state=$milestone_state&sort=created&direction=desc")

    if [ "$(echo "$milestones" | jq length)" -eq 0 ]; then
        echo -e "${RED}No milestones found${NC}"
        exit 1
    fi

    # Create temporary file with milestone options
    echo "$milestones" | jq -r '.[] | "\(.number)) \(.title)"' > "$TEMP_DIR/milestones.txt"

    # Read options into array
    local options=()
    while IFS= read -r line; do
        options+=("$line")
    done < "$TEMP_DIR/milestones.txt"

    local total=${#options[@]}

    if [ $total -eq 0 ]; then
        echo -e "${RED}No options available${NC}"
        return 1
    fi

    # Save terminal state and setup cleanup
    saved_tty="$(stty -g 2>/dev/null)"

    cleanup() {
        printf "\033[?25h"  # Show cursor
        if [ -n "$saved_tty" ]; then
            stty "$saved_tty" 2>/dev/null
        fi
    }

    trap cleanup EXIT INT TERM

    # Prepare terminal
    printf "\033[?25l"  # Hide cursor
    stty raw -echo 2>/dev/null

    # Initialize selection
    local selected=0

    # Main selection loop
    while true; do
        # Clear screen and display header
        printf "\033[H\033[2J"  # Move to top and clear screen
        printf "${BLUE}Use arrows to select a milestone (Enter to confirm, 'q' to quit):${NC}\n\n"

        # Display all options with absolute positioning
        for ((i=0; i<total; i++)); do
            printf "\033[%d;0H" "$((i + 3))"  # Position cursor at start of line
            if [ $i -eq $selected ]; then
                printf "${GREEN}> %s${NC}" "${options[$i]}"
            else
                printf "  %s" "${options[$i]}"
            fi
        done

        # Read user input
        IFS= read -r -n1 input

        case "$input" in
            $'\x1b')  # ESC sequence
                read -r -n2 seq
                case "$seq" in
                    '[A') # Up arrow
                        if [ $selected -gt 0 ]; then
                            ((selected--))
                        fi
                        ;;
                    '[B') # Down arrow
                        if [ $selected -lt $((total - 1)) ]; then
                            ((selected++))
                        fi
                        ;;
                esac
                ;;
            ''|$'\x0a') # Enter
                cleanup
                printf "\033[H\033[2J"  # Clear screen
                SELECTED_OPTION="${options[$selected]}"
                MILESTONE=$(echo "${SELECTED_OPTION}" | cut -d')' -f1)
                MILESTONE_TITLE=$(echo "$milestones" | jq -r ".[] | select(.number==$MILESTONE) | .title")
                printf "${GREEN}Selected: %s${NC}\n" "$SELECTED_OPTION"
                return 0
                ;;
            'q'|$'\x03') # q or Ctrl-C
                cleanup
                printf "\033[H\033[2J"  # Clear screen
                printf "Selection cancelled\n"
                return 1
                ;;
        esac
    done
}

# Main function
main() {
    # Check if docs/ directory exists
    if [ ! -d "$OUTPUT_DIR" ]; then
        echo -e "${RED}Directory $OUTPUT_DIR does not exist. Creating...${NC}"
        mkdir -p "$OUTPUT_DIR"
    fi

    setup_github_auth
    select_milestone

    if [ $? -ne 0 ]; then
        exit 1
    fi

    echo -e "${BLUE}Generating release notes for milestone $MILESTONE_TITLE...${NC}"

    # Initialize file
    rm -f "$OUTPUT_FILE"
    echo "## $MILESTONE_TITLE" > "$OUTPUT_FILE"
    echo "<br />" >> "$OUTPUT_FILE"

    # Fetch PRs
    prs=$(gh_api_get "issues?milestone=$MILESTONE&state=closed&pull_request")

    # Process each PR
    echo "$prs" | jq -c '.[]' | while read -r pr; do
        title=$(echo "$pr" | jq -r '.title')
        url=$(echo "$pr" | jq -r '.html_url')
        labels=$(echo "$pr" | jq -r '.labels[].name')
        user=$(echo "$pr" | jq -r '.user.login')
        avatar_url=$(echo "$pr" | jq -r '.user.avatar_url')

        pr_entry="- [$title]($url)"

        # Determine section
        section=""
        if echo "$labels" | grep -q "pr: new content"; then
            section="new_content"
        elif echo "$labels" | grep -q "pr: updated content"; then
            section="updated_content"
        elif echo "$labels" | grep -q "pr: fix\|pr: chore"; then
            section="chore"
        fi

        # If a section was identified
        if [ -n "$section" ]; then
            # Determine source
            source="repo"
            if echo "$labels" | grep -q "source: CMS"; then
                source="cms"
            elif echo "$labels" | grep -q "source: Strapi Cloud"; then
                source="cloud"
            fi

            # Create section file if it doesn't exist
            case "$section" in
                "new_content")
                    echo "### <Icon name='sparkle' /> New content" > "$TEMP_DIR/${section}_header"
                    echo "<br />" >> "$TEMP_DIR/${section}_header"
                    ;;
                "updated_content")
                    echo "### <Icon name='pen-nib' /> Updated content" > "$TEMP_DIR/${section}_header"
                    echo "<br />" >> "$TEMP_DIR/${section}_header"
                    ;;
                "chore")
                    echo "### <Icon name='broom' /> Chore, fixes, typos, and other improvements" > "$TEMP_DIR/${section}_header"
                    echo "<br />" >> "$TEMP_DIR/${section}_header"
                    ;;
            esac

            # Create source file if it doesn't exist
            case "$source" in
                "cms")
                    echo "#### CMS" > "$TEMP_DIR/${section}_${source}_header"
                    ;;
                "cloud")
                    echo "#### Cloud" > "$TEMP_DIR/${section}_${source}_header"
                    ;;
                "repo")
                    echo "#### Repository" > "$TEMP_DIR/${section}_${source}_header"
                    ;;
            esac

            # Add entry
            echo "$pr_entry" >> "$TEMP_DIR/${section}_${source}_content"
        fi

        # Save contributor information
        echo "$user|$avatar_url" >> "$TEMP_DIR/contributors_raw"
    done

    # Assemble final file
    first_section=true
    for section in "new_content" "updated_content" "chore"; do
        has_content=false

        # Check if we have content for this section
        for source in "cms" "cloud" "repo"; do
            if [ -f "$TEMP_DIR/${section}_${source}_content" ] && [ -s "$TEMP_DIR/${section}_${source}_content" ]; then
                has_content=true
                break
            fi
        done

        # If we have content, add the section and its subsections
        if [ "$has_content" = true ]; then
            if [ "$first_section" = true ]; then
                first_section=false
            else
                echo "" >> "$OUTPUT_FILE"
            fi

            cat "$TEMP_DIR/${section}_header" >> "$OUTPUT_FILE"

            first_subsection=true
            for source in "cms" "cloud" "repo"; do
                if [ -f "$TEMP_DIR/${section}_${source}_content" ] && [ -s "$TEMP_DIR/${section}_${source}_content" ]; then
                    echo "" >> "$OUTPUT_FILE"
                    cat "$TEMP_DIR/${section}_${source}_header" >> "$OUTPUT_FILE"
                    cat "$TEMP_DIR/${section}_${source}_content" >> "$OUTPUT_FILE"
                fi
            done
        fi
    done

    # Add contributors if any
    if [ -f "$TEMP_DIR/contributors_raw" ] && [ -s "$TEMP_DIR/contributors_raw" ]; then
        echo -e "\n***" >> "$OUTPUT_FILE"
        echo "This release was made possible thanks to the following contributors. Thank you! 🫶" >> "$OUTPUT_FILE"
        echo "<div>" >> "$OUTPUT_FILE"

        # Sort and deduplicate contributors
        sort -u "$TEMP_DIR/contributors_raw" | while IFS='|' read -r user avatar_url; do
            cat >> "$OUTPUT_FILE" << EOF
<a href="https://github.com/$user" target="_blank">
    <img className="no-zoom" src="$avatar_url" width="40" height="40" style={{borderRadius: '50%'}} alt="$user"/>
</a>
EOF
        done

        echo "</div>" >> "$OUTPUT_FILE"
        echo -e "<br/>\n<br/>" >> "$OUTPUT_FILE"
    fi

    echo -e "${GREEN}Release notes generated in $OUTPUT_FILE${NC}"
}

main