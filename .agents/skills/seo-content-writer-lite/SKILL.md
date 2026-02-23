---
name: seo-content-writer-lite
description: 'Use when the user asks to "write SEO content", "create a blog post", "write an article", "content writing", "draft optimized content". Creates high-quality, SEO-optimized content that ranks well. Applies on-page SEO best practices and keyword optimization. For updating existing content, see content-refresher.'
license: Apache-2.0
metadata:
  author: aaron-he-zhu
  version: "2.1.0"
  geo-relevance: "medium"
  tags:
    - seo
    - content writing
    - blog post
    - copywriting
  triggers:
    - "write SEO content"
---

# SEO Content Writer (Lite)

This skill creates search-engine-optimized content that ranks well while providing genuine value to readers. It applies proven SEO copywriting techniques, proper keyword integration, and optimal structure.

## How to Use

- `Write an SEO-optimized article about [topic] targeting the keyword [keyword]`
- `Create a 2,000-word guide for [topic] with keywords: [keyword list]`
- `Here's my brief: [brief]. Write SEO-optimized content following it.`

## Data Sources

**With SEO tool connected**: Auto-pull keyword metrics and SERP data (see CONNECTORS.md).
**Without tools**: Ask user for primary/secondary keywords, intent, word count, and competitor URLs.

## Instructions

Follow a streamlined 3-step process to generate high-ranking SEO content.

### Step 1: Pre-Write Planning & Research
Before writing, output a brief planning section:

```markdown
### Content Plan
- **Keywords**: Primary: [keyword], Secondary: [list]
- **Targeting**: [Audience description] | Intent: [informational/commercial/transactional]
- **Research Angle**: [Unique perspective]
- **CORE-EEAT Highlights**: Ensure direct answer early, headers logically structured, and high info density.
- **Title Options**:
  1. [Option 1]
  2. [Option 2] (Recommended: [Why])
- **Meta Description**: "[150-160 char description with CTA and keyword]"
- **Proposed Outline**: [H1 > H2s > H3s > FAQ > Conclusion]
```

### Step 2: Content Generation
Write the content following this structure. Integrate keywords naturally (1-2% density is a rough proxy, prioritize semantic relevance):

```markdown
# [H1 with Primary Keyword]

[Hook and introduction. Include primary keyword in first 100 words. Direct answer/value early.]

## [H2 - Section with Secondary Keyword]
[Body content: Use 3-5 sentence paragraphs, varied sentence length, formatting for readability]
> **Pro Tip**: [Insights]

### [H3 - Subsection]
- [Bulleted lists for readability]

## Frequently Asked Questions
### [PAA Question]?
[Direct 40-60 word answer for Featured Snippet optimization]

## Conclusion
[Summary of key points. Include primary keyword and clear CTA]
```

Ensure optimization for:
- **Featured Snippets**: Use clear Definition, List, Table, and How-To formats.
- **Internal/External Links**: Suggest contextual links to high-authority/relevant pages.

### Step 3: Post-Write Validation Checklist
Output a concise self-check table:

```markdown
### SEO & E-E-A-T Review
- [ ] **SEO Basics**: Title, Meta, H1, H2s optimized, First 100-words cover keyword.
- [ ] **CORE-EEAT Alignment**: Intent matches title, clear audience targeting, precise data/claims, 3+ query variants covered.
- [ ] **Readability & Engagement**: No fluff, short paragraphs, FAQ section, actionable takeaways.
```

## Example (Truncated)

**User**: "Write an SEO-optimized article about 'email marketing basics' targeting small businesses"

**Output**:

```markdown
### Content Plan
- **Keywords**: Primary: email marketing basics, Secondary: newsletter for small business
- **Targeting**: Small business owners | Intent: Informational
- **Title Options**:
  1. Email Marketing Basics: The Ultimate Guide for Small Businesses
  2. A Beginner's Guide to Email Marketing Basics (Recommended)

# A Beginner's Guide to Email Marketing Basics

**Meta Description**: Master email marketing basics to help your small business grow. Learn how to build your list, craft engaging emails, and drive sales today. (146 chars)

---

[Engaging hook...]
Email marketing remains one of the most effective channels, delivering high ROI. But where do you start?
In this guide, you'll learn the core email marketing basics your small business needs.

## Why Small Businesses Need Email Marketing
[Explanation of benefits, statistics...]

## Step 1: Building Your Email List
### Use Strategic Opt-in Incentives
[Details on lead magnets...]
> **Pro Tip**: The best lead magnets solve a specific, immediate problem.

## Frequently Asked Questions
### How often should small businesses send marketing emails?
For most small businesses, sending 1-2 emails per week strikes the right balance to stay top-of-mind without overwhelming subscribers.

## Conclusion
[Summary and clear call-to-action...]

### SEO & E-E-A-T Review
- [x] **SEO Basics**: ...
```

## Reference Materials
- [Title Formulas](./references/title-formulas.md) - Proven headline formulas
- [Content Structure Templates](./references/content-structure-templates.md) - Templates for common post types
- See broader skills index: `seo-geo-claude-skills` (keyword research, SEO audit, etc.)
