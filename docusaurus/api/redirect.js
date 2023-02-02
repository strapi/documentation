module.exports = async (req, res) => {
  // Insert redirect rules here
  console.log(req);
  if (req.url.startsWith('/developer-docs/latest/development/admin-customization')) {
    res.statusCode = 302
    res.setHeader('location', '/dev-docs/admin-panel-customization')
    // Caching headers
    // res.set('Cache-control', 's-maxage=600')
    return res.end()
  }
}
