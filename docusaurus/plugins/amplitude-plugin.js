function amplitudePlugin(context, options) {
  return {
    name: 'amplitude-plugin',
    getClientModules() {
      return [require.resolve('../src/analytics/amplitude.js')];
    },
  };
}

module.exports = amplitudePlugin;
