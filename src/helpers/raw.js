/**
 * Any code used inside this helper is ignored by Handlebars. Use it if your email service provider uses a Handlebars-like syntax.
 * @example
 * {{{{raw}}}}
 * {{ this }} code won't be parsed.
 * {{{{/raw}}}}
 */
module.exports = function(content) {
  return content.fn();
}

handlebars.registerHelper('ifvalue', function (conditional, options) {
  if (options.hash.value === conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this);
  }
});
