(function(back) {
  const SETTINGS_FILE = "chronometer.settings.json";
  const storage = require('Storage');

  // Default settings
  let defaults = {
    showWidgets: false,
    showLockIconWhenLocked: true
  };

  // Load and merge saved settings
  let settings = Object.assign({}, defaults, storage.readJSON(SETTINGS_FILE, 1) || {});

  function save() {
    storage.write(SETTINGS_FILE, settings);
  }


  E.showMenu({
    '': { 'title': 'Chronometer' },
    '< Back': back,
    'Show Widgets': {
      value: settings.showWidgets,
      onchange: v => {
        settings.showWidgets = v;
        save();
      }
    },
    'Lock Icon': {
      value: settings.showLockIconWhenLocked,
      onchange: v => {
        settings.showLockIconWhenLocked = v;
        save();
      }
    },
  });
});
