#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

# Keyword for skipping vercel CI
SUB1="skip ci"
SUB2="ci skip"
SUB3="skip vercel"
SUB4="vercel skip"

check_vercel_skip () {
    SKIP="no"
    case $VERCEL_GIT_COMMIT_MESSAGE in
        *"$SUB1"*)
            SKIP="yes"
            ;;
        *"$SUB2"*)
            SKIP="yes"
            ;;
        *"$SUB3"*)
            SKIP="yes"
            ;;
        *"$SUB4"*)
            SKIP="yes"
            ;;
    esac
    if [[ "$SKIP" == "yes" ]]; then
        echo "🛑 - Commit contains CI skip message, will not continue!"
        exit 0;
    else
        return
    fi
}

# Check if should be skipped
check_vercel_skip

if [[ "$VERCEL_GIT_COMMIT_REF" == "staging" || "$VERCEL_GIT_COMMIT_REF" == "staging.tmp" ]]; then
    echo "🛑 - Ignoring build step for this ref..."
    exit 0;
else
    echo "✅ - Proceeding build..."
    exit 1;
fi