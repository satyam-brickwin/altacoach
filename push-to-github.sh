#!/bin/bash

# Check if Git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing Git repository..."
  git init
fi

# Add all changes
echo "Adding all changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Add chat analysis feature to admin dashboard"

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
  echo "Please enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
  read repo_url
  git remote add origin $repo_url
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main || git push -u origin master

echo "Done!" 