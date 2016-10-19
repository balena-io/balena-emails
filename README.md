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

## Build Commands

Run `npm start` to kick off the build process. A new browser tab will open with a server pointing to your project files.

Current all files will get reloaded while developing except for `.js` and `.json`. This will be fixed soon just waiting for this [PR](https://github.com/zurb/panini/pull/82/commits/47173300605f49ee7372324ada229a28500ba871) to be merged.

Run `npm run build` to inline your CSS into your HTML along with the rest of the build process.

Run `npm run zip` to build as above, then zip HTML and images for easy deployment to email marketing services.
