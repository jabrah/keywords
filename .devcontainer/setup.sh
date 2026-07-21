#!/usr/bin/env bash
set -euo pipefail

# Install system dependencies
sudo apt-get update
sudo apt-get install -y imagemagick libvips-dev

# Install Ruby dependencies
gem install bundler
bundle install
