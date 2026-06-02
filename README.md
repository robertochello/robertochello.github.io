# Roberto Chello — Personal Portfolio

Personal portfolio website published with GitHub Pages and built with Jekyll using the Minimal Mistakes remote theme.

The site is designed to present a concise technical profile focused on industrial automation, PLC software engineering, robotics, control systems, and structured technical documentation.

## Live Site

- Website: https://robertochello.github.io
- Repository: https://github.com/robertochello/robertochello.github.io

## Technology Stack

- GitHub Pages
- Jekyll
- Minimal Mistakes remote theme
- Markdown / HTML
- Sass customization through the Jekyll asset pipeline

## Repository Structure

| Path | Purpose |
|---|---|
| `_config.yml` | Main Jekyll configuration, site metadata, collections, defaults and theme settings |
| `_layouts/` | Custom layouts that override or extend the remote theme |
| `_pages/` | Static pages such as About, Projects archive, Tags and Categories |
| `_repositories/` | Portfolio project entries rendered through the custom `repository` collection |
| `_posts/` | Technical posts, only when real articles are published |
| `assets/` | Images, CV, stylesheets and other static resources |
| `_data/navigation.yml` | Main navigation entries |

## Local Development

Install dependencies:

```bash
bundle install
```

Run the local development server:

```bash
bundle exec jekyll serve
```

Open the site locally:

```bash
http://localhost:4000
```

## Content Management

### Update the homepage

Edit:

```bash
_layouts/home.html
```

The homepage is intentionally implemented as a custom layout so the landing page can be structured independently from the default blog archive layout.

### Update the About page

Edit:

```bash
_pages/about.md
```

### Add a portfolio project

Create a new Markdown file inside:

```bash
_repositories/
```

Use this front matter pattern:

```yaml
---
title: "Project Title"
reponame: "repository-name"
repolink: "https://github.com/username/repository-name"
repodoc: false
excerpt: "Short project description."
technologies:
  - PLC
  - Python
  - Jekyll
status: "In progress"
---
```

Then write the project content using clear sections such as:

- Overview
- Objective
- Technical Scope
- Architecture
- Key Features
- Status

### Update the CV

Replace the PDF located at:

```bash
assets/cv/RobertoChello_CV_EN.pdf
```

The CV link is configured in `_config.yml` under the `author.links` section.

## Deployment

The site is deployed automatically through GitHub Pages from the default branch.

For routine updates, commit changes directly to the repository. For larger layout or structural changes, use a feature branch and open a pull request before merging.

## Maintenance Checklist

Before publishing structural changes:

- Verify that the site builds locally.
- Remove template/demo content.
- Check internal links: About, Projects, CV, Contact.
- Confirm that project entries include meaningful excerpts.
- Keep the language consistent across visible pages.
- Avoid adding unused plugins or assets.

## Ownership

Roberto Chello
