(function(back) {
  const SETTINGS_FILE = "Chronometry.settings.json";
  const storage = require('Storage');

  // Default settings
  let defaults = {
    showWidgets: false,
    theme: 'System',
    showLockIconWhenLocked: true,
  };

  // Load and merge saved settings
  let settings = Object.assign({}, defaults, storage.readJSON(SETTINGS_FILE, 1) || {});

  function save() {
    storage.write(SETTINGS_FILE, settings);
  }

  var wallpaper_options = ['Drool', 'Light', 'Dark'];

  E.showMenu({
    '': { 'title': 'Chronometry' },
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
     'Wallpaper': {
      value: Math.max(0, wallpaper_options.indexOf(settings.theme)),
      min: 0, max: wallpaper_options.length - 1,
      format: v => wallpaper_options[v],
      onchange: v => {
        settings.wallpaper = wallpaper_options[v];
        save();
      }
    },

  });
});
