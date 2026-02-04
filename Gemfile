source "https://rubygems.org"

# Jekyll dependencies
gem 'csv'
gem 'base64'
gem 'bigdecimal'
gem 'webrick'

# Jekyll version compatible with GitHub Pages
gem "jekyll", "~> 3.9.0"

# Kramdown parser for GitHub Flavored Markdown
gem "kramdown-parser-gfm"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-paginate"
  gem "jekyll-feed"
  gem "jekyll-sitemap"
end

# GitHub Pages gem (optional, but recommended for local testing)
# Uncomment the line below if you want to match GitHub Pages environment exactly
# gem "github-pages", group: :jekyll_plugins

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
