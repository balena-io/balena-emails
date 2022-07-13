const gulp = require('gulp')
const mjml = require('gulp-mjml')
const mjmlEngine = require('mjml')
const size = require('gulp-size')
const copy = require('gulp-copy')
const hb = require('gulp-hb')
const rename = require('gulp-rename')
const rimraf = require('rimraf')
const browser = require('browser-sync')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const Mailchimp = require('mailchimp-api-v3')
const NetlifyAPI = require('netlify')
const helpers = require('handlebars-helpers')

// Add mjml extension support to handlebars
require.extensions[ '.mjml' ] = function (module, filename) {
  module.exports = handlebars.compile(fs.readFileSync(filename, 'utf8'))
}

// Check if required arguments are valid
if (!argv.datafile || !fs.existsSync(argv.datafile)) {
  console.log(`Invalid data file: ${argv.datafile || 'no file provided'}.`)
  console.log(`Usage: npm run <script> -- --datafile path/to/datafile.json --template <newsletter|survey|account-verification>`)
  process.exit(0)
} else {
  console.log(`Loading ${path.join(__dirname, argv.datafile)}. WARNING: Changes on this file are not watched.`)
}

if (!argv.template || ![ 'newsletter', 'announcement', 'account-verification'].includes(argv.template)) {
  console.log(`Invalid template selected: ${argv.template}`)
  console.log(`Usage: npm run <script> -- --datafile path/to/datafile.json --template <newsletter|survey|account-verification>`)
  process.exit(0)
} else {
  console.log(`Using ${argv.template} template...`)
}

// Gulp tasks
gulp.task('watch', gulp.series(clean, copy_assets, build_handlebars, build_mjml, index_size, serve, watch))
gulp.task('build', gulp.series(clean, copy_assets, build_handlebars, build_mjml, index_size))
gulp.task('staging', gulp.series(clean, copy_assets, build_handlebars, build_mjml, index_size, publish_netlify))
gulp.task('publish', gulp.series(clean, copy_assets, build_handlebars, build_mjml, index_size, publish_netlify, publish_mailchimp))

// Clean dist directory
function clean (done) {
  rimraf('dist', done)
}

// Watch for file changes
function watch () {
  gulp.watch([ 'src' ]).on('change', gulp.series(build_handlebars, build_mjml, browser.reload))
}

// Start a server with LiveReload to preview the site in
function serve (done) {
  browser.init({ server: 'dist', index: 'index.html' })
  done()
}

function copy_assets (done) {
  let dataJSON = require(path.join(__dirname, argv.datafile)).configuration || {}
  let assets_folder = `${path.dirname(argv.datafile)}/${dataJSON.assets_folder}`

  if (dataJSON.assets_folder && fs.existsSync(assets_folder)) {
    return gulp
      .src([ `${assets_folder}/*` ])
      .pipe(copy('./dist', { prefix: assets_folder.split('/').length - 1 }))
  } else {
    done()
  }
}

// MJML build: Convert index.mjml into index.html
function build_mjml (done) {
  return gulp.src(`./dist/${argv.template}.mjml`)
    .pipe(mjml(mjmlEngine, { minify: true }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist'))
}

// HB build: expand hb sintax in .mjml files
function build_handlebars () {
  return gulp
    .src(`./src/templates/${argv.template}.mjml`)
    .pipe(hb()
      .partials('./src/partials/*.mjml')
      .helpers(helpers)
      .data(require(path.join(__dirname, argv.datafile)))
    )
    .pipe(gulp.dest('./dist'))
}

// Get index.html size
function index_size () {
  return gulp.src('./dist/index.html')
    .pipe(size({ title: 'index.html size (keep under 102kB): '}))
    .pipe(gulp.dest('dist'))
}

// Netlify: Create site and deploy files
async function publish_netlify (done) {
  // Bail if Netlify auth token was not provided
  if (!argv.netlifytoken) {
    console.log('No Netlify token provided.')
    console.log('Usage: npm run staging -- --datafile path/to/datafile.json --template <newsletter|survey> --netlifytoken <NETLIFY_AUTH_TOKEN>')
    return done()
  }

  let netlify = new NetlifyAPI(argv.netlifytoken)
  let dataJSON = require(path.join(__dirname, argv.datafile)).configuration || {}
  let data = {
    siteName: dataJSON.netlify_site_name || 'balena-default-site', // default site
  }

  try {
    let sites = await netlify.listSites()
    let site = sites.find(s => s.name === data.siteName)

    // Create site if it doesn't exist
    if (!site) {
      console.log(`Site '${data.siteName}' not found on Netlify account. Creating a new one...`)
      site = await netlify.createSite({ body: { name: data.siteName } })
      console.log(`Created new site with id ${site.id}`)
    } else {
      console.log(`Site already exists with name ${data.siteName} and id ${site.id}`)
    }

    // Deploy
    let deployment = await netlify.deploy(site.id, './dist')
    console.log(`Successfully deployed to ${deployment.deploy.url}`)
  } catch (error) {
    console.log(error)
    done(error)
  }
}

// Mailchimp: Create draft campaign, add content, send test email
async function publish_mailchimp (done) {
  // Bail if Mailchimp key was not provided
  if (!argv.mailchimpkey) {
    console.log('No Mailchimp key provided.')
    console.log('Usage: npm run publish -- --datafile path/to/datafile.json --template <newsletter|survey> --netlifytoken <NETLIFY_AUTH_TOKEN> --mailchimpkey <MAILCHIMP_API_KEY>')
    return done()
  }

  let mailchimp = new Mailchimp(argv.mailchimpkey)
  let dataJSON = require(path.join(__dirname, argv.datafile)).configuration || {}
  let data = {
    recipients: dataJSON.mailchimp_recipients || 'ab92290a0b', // default to 'Test audience'
    subject_line: dataJSON.mailchimp_subject_line || 'Autogenerated campaign -- Default subject line',
    preview_text: dataJSON.mailchimp_preview_text || 'Autogenerated campaign -- Default preview text',
    title: dataJSON.mailchimp_title || 'Autogenerated campaign -- Default title',
    from_name: dataJSON.mailchimp_from_name || 'balena',
    reply_to: dataJSON.mailchimp_reply_to || 'hello@balena.io',
    test_emails: dataJSON.mailchimp_test_emails || [],
    site_name: dataJSON.netlify_site_name || 'balena-default-site'
  }

  try {
    // Get campaigns created in the past month that were not sent
    let lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    let getCampaignsOptions = {
      status: 'save',
      type: 'regular',
      since_create_time: lastMonth.toISOString(),
      count: 1000
    }
    let { campaigns } = await mailchimp.get('/campaigns', getCampaignsOptions)

    // Create only if campaign does not exist, we use the title as the unique key
    let createCampaignOptions = {
      type: 'regular',
      recipients: { list_id: data.recipients },
      settings: {
        subject_line: data.subject_line,
        preview_text: data.preview_text,
        title: data.title,
        from_name: data.from_name,
        reply_to: data.reply_to
      }
    }
    let campaign = campaigns.find(c => c.settings.title === data.title)
    if (!campaign) {
      console.log(`Campaign '${data.title}' not found on Mailchimp. Creating a new one...`)
      campaign = await mailchimp.post('/campaigns', createCampaignOptions)
      console.log(`Created campaign with id ${campaign.id} and web_id ${campaign.web_id}`)
    } else {
      console.log(`Campaign already exists with name ${data.title} and id ${campaign.id}`)
    }

    // Update campaign content
    let contentOptions = {
      url: `https://${data.site_name}.netlify.com/`
    }
    await mailchimp.put(`/campaigns/${campaign.id}/content`, contentOptions)
    console.log(`Successfully published HTML template to campaign ${campaign.id} and web_id ${campaign.web_id}`)

    // Send test email
    if (data.test_emails.length > 0) {
      let testEmailOptions = {
        test_emails: data.test_emails,
        send_type: 'html'
      }
      await mailchimp.post(`/campaigns/${campaign.id}/actions/test`, testEmailOptions)
      console.log(`Successfully sent test emails to ${data.test_emails.join(',')}`)
    }

    done()
  } catch (error) {
    console.log(error)
    done(error)
  }
}
