# Balena newsletter generator

This is a generator for balena emails, it uses [zurb's email framework](http://foundation.zurb.com/emails/docs) which borrows templating principles from static site generators(handlebars.js). It also includes a minimal templating language that converts simple HTML tags into the complex table HTML required for emails, so you don't have thousands of `tables` in your markup.

- Handlebars HTML templates with [Panini](http://github.com/zurb/panini)
- Simplified HTML email syntax with [Inky](http://github.com/zurb/inky)
- Sass compilation
- Image compression
- Built-in BrowserSync server
- Full email inlining process

## Installation

To use this template, your computer needs [Node.js](https://nodejs.org/en/) 0.12 or greater.
```
git pull https://github.com/balena-io/balena-emails
```
```
npm i
```

## Editing

To update data of the newsletter you need to update the data in `/src/data`. Each `<data>.json` corresponds to a section in the newsletter. Generally you'd only need to change `featured, posts, & events`.

## Build Commands

#### When developing

> NOTE: Currently running on node version 8.16.0.

* Run `npm start` to kick off the build process. A new browser tab will open with a server pointing to your project files.

Current all files will get reloaded while developing except for `.js` and `.json`.

#### When building

* Run `npm run build` to inline your CSS into your HTML along with the rest of the build process.

## Sending out the newsletter

Once you have run the build command you should have a built `/build` folder with all the data compiled for the email.
Just zip the folder and move to the next step.

Login to mailchimp and follow

* Create a campaign [ name format: `Mounth Year` ] -> Add subject, list etc and select template.
* When editing the template, select to add a custom template and upload the zipped file containing the design files.
* Send you're self + some others a test email from template editor.
* Scheduling the campaign. Generally we use time warp so that users receive it in their tz (Keep in mind you need to start the scheduler 24hrs earlier for this feature). We also generally send it out at 3pm on wednesdays.
* :tada

Once you're done commit + push your changes.

```
git commit -am `<month year>` && git push
```
