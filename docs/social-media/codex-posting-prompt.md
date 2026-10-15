# Prompt for Codex — publish the PricePilot carousel on LinkedIn

Copy everything below the line into Codex.

---

You are going to publish one carousel post on my LinkedIn account. Work on
my machine. Do not improvise content: every word and every image already
exists on disk, and your job is to place them, not to write them.

## What to post

**Text** — the exact contents of this file, unchanged:

    ~/Dev/pricepilot/docs/social-media/linkedin-post-pt.txt

If I tell you to post in English instead, use this one:

    ~/Dev/pricepilot/docs/social-media/linkedin-post-en.txt

Read the file and use it verbatim. Do not rewrite it, do not "improve" it,
do not add emoji, do not add or remove hashtags, and do not reformat the
line breaks — the blank lines between paragraphs are deliberate and LinkedIn
renders them.

**Images** — five PNGs, 1080 × 1350, attached in this exact order:

    ~/Dev/pricepilot/docs/social-media/composed/1-presentation.png
    ~/Dev/pricepilot/docs/social-media/composed/2-problem.png
    ~/Dev/pricepilot/docs/social-media/composed/3-solution.png
    ~/Dev/pricepilot/docs/social-media/composed/4-technology.png
    ~/Dev/pricepilot/docs/social-media/composed/5-result.png

Order matters: the carousel tells a sequence — presentation, problem,
solution, technology, result. Do not crop, resize, compress or edit any of
them. Do not generate a replacement for one that fails to upload.

## Checks to run before you post

Run these first and stop if any of them fails:

1. Both links in the post body return HTTP 200:

       curl -s -o /dev/null -w "%{http_code}\n" -L https://pricepilot-eta.vercel.app
       curl -s -o /dev/null -w "%{http_code}\n" -L https://github.com/zps-commits/pricepilot

2. The text file is under 3000 characters:

       wc -m ~/Dev/pricepilot/docs/social-media/linkedin-post-pt.txt

   LinkedIn truncates anything longer. If it is over, stop and tell me
   rather than cutting it yourself.

3. All five PNGs exist and are non-empty.

If any check fails, stop and report. Do not post a partial version.

## How to post

Open LinkedIn in a browser, start a new post on my personal profile, paste
the text, attach the five images in order, and show me the composed post.

**Stop there.** Show me what the post looks like before anything is
published, and wait for me to say go. Do not press publish, do not schedule
it, and do not post to a company page — this goes on my personal profile.

If LinkedIn is not logged in, stop and tell me. Do not attempt to log in,
and do not ask me for credentials in chat.

## Hard rules

- The text and the images are final. If you think something is wrong with
  them, say so and stop — do not fix it yourself.
- Do not invent any figure. The post cites 77 tests and zero accessibility
  violations; those are measured results. There are no users, no clients and
  no revenue for this project, and nothing of that kind may be added.
- Do not add a link that is not already in the text.
- One post. Do not also post the English version. If MenuFlow has already
  gone out, do not post this on the same day — space them out.

## After it is published

Tell me the URL of the published post.
