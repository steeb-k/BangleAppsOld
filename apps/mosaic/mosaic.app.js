Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
};

{
const SETTINGS_FILE = "mosaic.settings.json";
let settings;
let theme;
let timeout = 60;
let drawTimeout;
let colours = [
  '#f00', '#00f', '#0f0', '#ff0', '#f0f', '#0ff',
  '#8f0', '#f08', '#f80', '#80f', '#0f8', '#08f',
];
let digits = [
  E.toArrayBuffer(atob("BQcB/Gtax+A=")),
  E.toArrayBuffer(atob("BQeCAX9c1zXNc1zX9A==")),
  E.toArrayBuffer(atob("BQcB/Hsbx+A=")),
  E.toArrayBuffer(atob("BQcB/Hsex+A=")),
  E.toArrayBuffer(atob("BQeCAf/zPM8D/Nc1/A==")),
  E.toArrayBuffer(atob("BQcB/G8ex+A=")),
  E.toArrayBuffer(atob("BQcB/G8ax+A=")),
  E.toArrayBuffer(atob("BQeCAf/wP81zXNc1/A==")),
  E.toArrayBuffer(atob("BQcB/Gsax+A=")),
  E.toArrayBuffer(atob("BQcB/Gsex+A="))
];

// Day of week abbreviations
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

let loadSettings = function() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'showWidgets': false, 'theme':'System'};
}

let loadThemeColors = function() {
  theme = {fg: g.theme.fg, bg: g.theme.bg};
  if (settings.theme === "Dark") {
    theme.fg = g.toColor(1,1,1);
    theme.bg = g.toColor(0,0,0);
  }
  else if (settings.theme === "Light") {
    theme.fg = g.toColor(0,0,0);
    theme.bg = g.toColor(1,1,1);
  }
}

let queueDraw = function(seconds) {
  let millisecs = seconds * 1000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, millisecs - (Date.now() % millisecs));
}

let draw = function() {
  // draw colourful grid
  for (let i_x = 0; i_x < num_squares_w; i_x++) {
    for (let i_y = 0; i_y < num_squares_h; i_y++) {
      g.setColor(colours.sample()).fillRect(
        o_w+i_x*s, o_h+i_y*s, o_w+i_x*s+s, o_h+i_y*s+s
      );
    }
  }
  
  let now = new Date();
  let t = require("locale").time(now, 1);
  let hour = parseInt(t.split(":")[0]);
  let minute = parseInt(t.split(":")[1]);
  let dayOfWeek = days[now.getDay()];
  
  // Draw time (shifted left)
  g.setBgColor(theme.fg);
  g.setColor(theme.bg);
  g.drawImage(digits[Math.floor(hour/10)], (mid_x-7)*s+o_w, (mid_y-7)*s+o_h, {scale:s});
  g.drawImage(digits[hour % 10], (mid_x-1)*s+o_w, (mid_y-7)*s+o_h, {scale:s});
  g.drawImage(digits[Math.floor(minute/10)], (mid_x-7)*s+o_w, (mid_y+1)*s+o_h, {scale:s});
  g.drawImage(digits[minute % 10], (mid_x-1)*s+o_w, (mid_y+1)*s+o_h, {scale:s});
  
  // Draw day of week (vertical to the right of time)
  g.setFontAlign(0, 0);
  g.setFont("Vector", 30);  // Scalable vector font, clean and large
  
  // Calculate position for each character
  let dayX = (mid_x + 7) * s + o_w; // unchanged
  let lineSpacing = 3 * s;
  let timeBottom = (mid_y + 1) * s + o_h + 7 * s;
  let dayY = timeBottom - (dayOfWeek.length * lineSpacing) + lineSpacing / 2;

  // Draw each character vertically with matching time style
  for (let i = 0; i < dayOfWeek.length; i++) {
    let y = dayY + i * 3 * s;
    // Draw filled background box
    g.setColor(theme.bg);
    g.fillRect(dayX - 15, y - 16, dayX + 12, y + 14); // Adjust box size as needed
    // Draw character
    g.setColor(theme.fg);
    //drawBoldText(dayOfWeek[i], dayX, y);
    g.drawString(dayOfWeek[i], dayX, y);
  }
  const boxLeft = dayX - 15;
  const boxRight = dayX + 12;
  const boxWidth = boxRight - boxLeft;


  let batt = E.getBattery(); // battery %
  let battTop = dayY - lineSpacing; // position just above the first letter box
  let battHeight = 10;

  g.setColor(theme.bg);
  g.fillRect(boxLeft, battTop, boxRight, battTop + battHeight); // battery background

  g.setColor(theme.fg);
  let battFill = Math.round((batt / 100) * boxWidth);
  g.fillRect(boxLeft, battTop, boxLeft + battFill, battTop + battHeight); // battery fill

  queueDraw(timeout);
}

g.clear();
loadSettings();
loadThemeColors();

const offset_widgets = settings.showWidgets ? 24 : 0;
let available_height = g.getHeight() - offset_widgets;

// Calculate grid size and offsets
let s = Math.floor(available_height/17);
let num_squares_w = Math.round(g.getWidth()/s) - 1;
let num_squares_h = Math.round(available_height/s) - 1;
let o_w = Math.floor((g.getWidth() - num_squares_w * s)/2);
let o_h = Math.floor((g.getHeight() - num_squares_h * s+offset_widgets)/2);
let mid_x = Math.floor(num_squares_w/2);
let mid_y = Math.floor((num_squares_h-1)/2);

Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI({
  mode : 'clock',
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Array.prototype.sample;
    require('widget_utils').show(); // re-show widgets
  }
});

Bangle.loadWidgets();
if (settings.showWidgets) {
  Bangle.drawWidgets();
} else {
  require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
}

draw();
}
