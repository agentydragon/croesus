# AI Spend Audit Report: SampleCo

Month reviewed: 2026-06
Rows analyzed: 10
Estimated monthly waste: $1,050
Net first-month upside after $100 fee: $1,475
Estimated payback: 14.8x

## Findings

| Priority | Finding | Estimated monthly impact | Recommendation |
| --- | --- | ---: | --- |
| P1 | Premium model traffic looks routable | $700 | Premium models account for 82% of observed spend. Route low-risk extraction, summaries, and search tasks to cheaper models before using the premium path. |
| P2 | Prompt caching is underused | $296 | Only 26% of eligible input tokens appear cached. Stable system prompts and repeated retrieval prefixes should be cache-friendly. |
| P3 | Context windows are likely oversized | $275 | 5 rows average more than 1,200 input tokens per request. Trim repeated instructions, add retrieval caps, and log prompt templates by feature. |
| P4 | Spend spikes need budget guards | $196 | 2 usage rows are more than 2.2x the median row cost. Add per-feature budgets and alert before runaway agent loops hit production invoices. |

## First Implementation Step

Premium models account for 82% of observed spend. Route low-risk extraction,
summaries, and search tasks to cheaper models before using the premium path.

## Data Needed Next Month

- Date
- Feature or team
- Model
- Input tokens
- Output tokens
- Cached tokens
- Request count
- Cost
