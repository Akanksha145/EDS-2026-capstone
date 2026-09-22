# Divider

A horizontal rule that separates content regions.

## Why this block exists

In Edge Delivery Services, a literal `<hr>` written into page content is
consumed by `decorateSections()` as a **section boundary** — it splits the page
into separate sections instead of rendering a visible line. The `divider` block
draws the rule in place without that side effect, so authors get a predictable
separator anywhere in the content flow.

## Authoring

Insert a **Divider** block. It takes no content — the block's presence renders
the rule.

| Divider |
| ------- |

## Variants

Add the variant name in parentheses after the block name (e.g. `Divider (accent)`):

| Variant   | Appearance                                                        |
| --------- | ----------------------------------------------------------------- |
| _default_ | Full-width 1px light-grey (`#ebebeb`) hairline                    |
| `accent`  | Short 84px WKND-yellow 2px rule (matches the section-title accent) |
| `spacing` | Invisible — adds vertical whitespace only, no visible line        |

## Notes

- The block owns its vertical spacing (`40px` top and bottom). Adjust in
  `divider.css` if a tighter/looser gap is needed.
- Default color `#ebebeb` matches the existing FAQ and members-only separators;
  the accent variant reuses `--accent-color`.
