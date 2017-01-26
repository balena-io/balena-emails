# resin emails

This is a generator for resin emails, it uses [zurb's email framework](http://foundation.zurb.com/emails/docs) which borrows templating principles from static site generators(handlebars.js). It also includes a minimal templating language that converts simple HTML tags into the complex table HTML required for emails, so you don't have thousands of `tables` in your markup.

- Handlebars HTML templates with [Panini](http://github.com/zurb/panini)
- Simplified HTML email syntax with [Inky](http://github.com/zurb/inky)
- Sass compilation
- Image compression
- Built-in BrowserSync server
- Full email inlining process

## Installation

To use this template, your computer needs [Node.js](https://nodejs.org/en/) 0.12 or greater.
```
git pull https://github.com/resin-io/resin-emails
```
```
npm i
```

## Editing

To update data of the newsletter you need to update the data in `/src/data`. Each `<data>.json` corresponds to a section in the newsletter. Generally you'd only need to change `featured, posts, & events`.

## Build Commands

#### When developing

* Run `npm start` to kick off the build process. A new browser tab will open with a server pointing to your project files.

Current all files will get reloaded while developing except for `.js` and `.json`. This will be fixed soon just waiting for this [PR](https://github.com/zurb/panini/pull/82/commits/47173300605f49ee7372324ada229a28500ba871) to be merged.

#### When building

* Run `npm run build` to inline your CSS into your HTML along with the rest of the build process.

## Sending out the newsletter

Once you have run the build command you should have a built `/build/index.html` with all the css inlined.

Login to mailchimp and follow

* Create new template [ name format: `December 16` ]-> import html -> select `/build/index.html`.
* Send you're self + some others a test email from template editor.
* Create a campaign [ name format: `December 16` ] -> Add subject, list etc and select template.
* Scheduling the campaign. Generally we use time warp so that users receive it in their tz (Keep in mind you need to start the scheduler 24hrs earlier for this feature). We also generally send it out at 3pm on wednesdays.
* :tada

Once you're done commit + push your changes.

```
git commit -am `<month year>` && git push
```
