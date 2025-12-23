// Utility to clean quoted env vars
function clean(val) {
  if (!val) return val;
  return val.toString().replace(/^['"]|['"]$/g, "");
}

module.exports = { clean };
