#!/bin/bash

# Development Workflow Script
# Usage: ./scripts/dev-workflow.sh [commit-message]

echo "🚀 Starting development workflow..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Switch to dev branch if not already there
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "🔄 Switching to dev branch..."
    git checkout dev
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to switch to dev branch"
        exit 1
    fi
fi

# Pull latest changes
echo "⬇️  Pulling latest changes..."
git pull origin dev
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to pull latest changes"
    exit 1
fi

# Check if there are any changes to commit
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit"
    echo "🎉 Ready to start development!"
else
    echo "📝 Changes detected..."
    
    # If commit message provided, commit changes
    if [ $# -eq 1 ]; then
        echo "💾 Committing changes with message: $1"
        git add .
        git commit -m "$1"
        
        if [ $? -eq 0 ]; then
            echo "🚀 Pushing changes..."
            git push origin dev
            if [ $? -eq 0 ]; then
                echo "✅ Changes pushed successfully!"
            else
                echo "❌ Error: Failed to push changes"
                exit 1
            fi
        else
            echo "❌ Error: Failed to commit changes"
            exit 1
        fi
    else
        echo "📋 Changes staged but not committed. Use: ./scripts/dev-workflow.sh 'your commit message'"
        echo "📊 Status:"
        git status --short
    fi
fi

echo "🎯 Development workflow complete!"
