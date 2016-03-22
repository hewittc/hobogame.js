var gfx = 'gfx/';

document.getElementById('icon').src = gfx + 'pdf.png';

var issues;
function get_issues(callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function(data) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      issues = JSON.parse(xhr.responseText);
      for (index in issues) {
        var issue = document.createElement('a');
        issue.id = index;
        issue.innerHTML = issues[index].issue;
        issue.onclick = function() {
          show_info(this.id);
        };
        if (index > 0) {
          document.getElementById('issues').insertAdjacentHTML('beforeend', ' | ');
        }
        document.getElementById('issues').appendChild(issue);
      }
      document.getElementById('truth').style.display = 'block';
      callback();
    }
  }
  xhr.open('GET', 'issues', true);
  xhr.send();
}

function show_info(index) {
  document.getElementById('pdf').href = issues[index].file;
  document.getElementById('file').innerHTML = issues[index].file.toUpperCase();
  document.getElementById('issue').innerHTML = 'Poc||GTFO ' + issues[index].issue + ': ' + issues[index].caption;
  document.getElementById('released').innerHTML = issues[index].release;
  document.getElementById('md5').innerHTML = issues[index].md5;
  document.getElementById('sha256').innerHTML = issues[index].sha256;
}

/* apologies to @travisgoodspeed and @neighbortee for this port of hobogame: https://github.com/skytee/hobogame */

var canvas = document.createElement('canvas'); document.body.appendChild(canvas);
var context = canvas.getContext('2d');

var map_position = 0;
var map_direction = 1;

var fg_speed = 3;
var bg_speed = 1;

var ground = [];
var ground_map = [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 4, 5, 6, 4, 5, 7, 2, 2, 2, 2, 2, 2, 2, 2, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 2, 2, 2, 2, 14, 0, 0, 0];
var ground_size = [64, 48];

var mountain = [];
var mountain_map = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
var mountain_size = [162, 288];

var sprites = 'ground-grass ground-grass2stone ground-stone ground-stone2bridge ground-bridge1 ground-bridge2 ground-bridge-pillar ground-bridge2stone ground-dirt2stone ground-grass2stone ground-stone2bridge ground-stone2dirt ground-dirt ground-dirt2stone ground-stone2grass mountain-flat mountain-glacier mountain-kermit mountain-m'.split(' ');
for (sprite in sprites) {
  var img = new Image();
  img.src = gfx + sprites[sprite] + '.png';
  if (sprites[sprite].indexOf('ground-')) {
    mountain.push(img);
  } else {
    ground.push(img);
  }
}

var truth = "Howdy,\nneighbor!";

var hobo = [];
var hobo_size = [28, 48];
var hobo_position = parseInt(window.innerWidth / 2);
var hobo_offset = 240;
var hobo_wandered = 0;
var hobo_guided = Date.now();
var hobo_moving = false;
var hobo_preaching = true;

var hobos = new Image();
hobos.onload = function() {
  for (var i = 0; i < 15; i++) {
    var slice = document.createElement('canvas');
    slice.width = hobo_size[0];
    slice.height = hobo_size[1];

    var slicectx = slice.getContext('2d');
    slicectx.drawImage(hobos, i * slice.width, 0, slice.width, slice.height, 0, 0, slice.width, slice.height);
    hobo.push(slice);
  }
}
hobos.src = gfx + 'hobo.png';

function keydown_right() {
  map_direction = +1;
  hobo_moving = true;
}

function keydown_left() {
  map_direction = -1;
  hobo_moving = true;
}

function keydown(event) {
  if (event.defaultPrevented) {
    return;
  }

  hobo_guided = Date.now();

  var source;
  if (event.key !== undefined) {
    source = event.key;
  } else if (event.code !== undefined) {
    source = event.code;
  } else {
    source = event.keyCode;
  }

  switch (source) {
    case 'ArrowRight': case 39: keydown_right(); break;
    case 'ArrowLeft':  case 37: keydown_left();  break;
    default: return;
  }

  event.preventDefault();
}

function keyup_right() {
  if (map_direction > 0) {
    hobo_moving = false;
  }
}

function keyup_left() {
  if (map_direction < 0) {
    hobo_moving = false;
  }
}

function keyup(event) {
  if (event.defaultPrevented) { 
    return; 
  }

  var source;
  if (event.key !== undefined) {
    source = event.key;
  } else if (event.code !== undefined) {
    source = event.code;
  } else {
    source = event.keyCode;
  }

  switch (source) {
    case 'ArrowRight': case 39: keyup_right(); break;
    case 'ArrowLeft':  case 37: keyup_left();  break;
    default: return;
  }

  event.preventDefault();
}

function wander(callback) {
  var rand = Math.floor(Math.random() * 100);
  if (rand < 15) {
    if (!hobo_preaching && !hobo_moving) {
      keydown_left();
    }
  } else if (rand < 30) {
    if (!hobo_preaching && !hobo_moving) {
      keydown_right();
    }
  } else if (rand < 50) {
      keyup_left();
      keyup_right();
  }

  callback();
}

function think(callback) {
  var rand = Math.floor(Math.random() * 100);
  if (rand >= 42) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(data) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        truth = xhr.responseText;
        callback();
      }
    }
    xhr.open('GET', 'travis', true);
    xhr.send();
  } else {
    hobo_preaching = false;
  }
}

function preach(truth) {
  if (truth.length < 4) {
    return;
  }

  context.lineWidth = '3';
  context.strokeStyle = 'black';
  context.fillStyle = 'white';

  var x = hobo_position;
  var y = hobo_offset;

  var flip = 1;
  if (map_direction < 0) {
    flip = -1;
  } else {
    x += hobo_size[0];
  }

  var split = truth.split('\n');
  var longest = '';
  for (line in split) {
    if (split[line].length > longest.length) {
      longest = split[line];
    }
  }

  var font_size = 16;
  var width = context.measureText(longest).width + 10;
  var height = (font_size * split.length) + (2 * (split.length + 4)) + 8;

  var polygon = [
    [x, y], 
    [x + (flip * 10), y - 10], 
    [x + (flip * width), y - 10], 
    [x + (flip * width), y - height], 
    [x, y - height], 
    [x, y - 10], 
    [x + (flip * 10), y - 10], 
    [x + (flip * 5), y - 10]
  ];

  context.beginPath();
  for (var i = 0; i < 8; i++) {
    if (i > 0) {
      context.lineTo(polygon[i][0], polygon[i][1]);
    } else {
      context.moveTo(polygon[i][0], polygon[i][1]);
    }
  }
  context.closePath();
  context.stroke();
  context.fill();

  if (map_direction > 0) {
    flip = 0;
  }

  context.font = font_size + 'px topazplus';
  context.fillStyle = 'black';
  for (line in split) {
    context.fillText(split[line], x + (flip * width) + 5, y - height + (font_size * (parseInt(line) + 1) + (2 * (parseInt(line)) + 4)));
  }
}

var last_draw = Date.now();
function draw() {
  if ((Date.now() - last_draw) > 20) {
    var bg_position, fg_position, scroll_position, tile, num;
    for (var i = -1; i <= (canvas.width / mountain_size[0]) + 1; i++) {
      bg_position = map_position * bg_speed;
      scroll_position = ((bg_position % mountain_size[0]) * -1) + (i * mountain_size[0]);
      tile = (i + parseInt(bg_position / mountain_size[0])) % mountain_map.length;
      if (tile < 0) {
        tile = mountain_map.length + tile;
      }
      num = mountain_map[tile];
      context.drawImage(mountain[num], scroll_position, 0, mountain_size[0], mountain_size[1]);
    }

    for (var i = -1; i <= (canvas.width / ground_size[0]) + 1; i++) {
      fg_position = map_position * fg_speed;
      scroll_position = ((fg_position % ground_size[0]) * -1) + (i * ground_size[0]);
      tile = (i + parseInt(fg_position / ground_size[0])) % ground_map.length;
      if (tile < 0) {
        tile = ground_map.length + tile;
      }
      num = ground_map[tile];
      context.drawImage(ground[num], scroll_position, mountain_size[1], ground_size[0], ground_size[1]);
    }

    if (!hobo_moving) {
      if (map_direction >= 0) {
        context.drawImage(hobo[6], hobo_position, hobo_offset);
      } else {
        context.drawImage(hobo[7], hobo_position, hobo_offset);
      }
    } else {
      fg_position = parseInt(map_position / 4);
      tile = Math.abs(fg_position % 6);
      if (map_direction == 1) {
        context.drawImage(hobo[tile], hobo_position, hobo_offset);
      } else {
        context.drawImage(hobo[13 - tile], hobo_position, hobo_offset);
      }
    }

    if (hobo_preaching) {
      preach(truth);
    }

    if (hobo_moving) {
      map_position += map_direction;
    }

    last_draw = Date.now();
  }

  window.requestAnimationFrame(draw);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = 336;
  hobo_position = parseInt(window.innerWidth / 2);
}

window.onload = function() {
  get_issues(function() { show_info(0); });

  window.setTimeout(function() {
    hobo_preaching = false;
  }, (50 * truth.length) + 2000);

  window.setInterval(function() {
    if ((Date.now() - hobo_guided) > 2000 && (Date.now() - hobo_wandered) > 1000) {
      wander(function() {
        hobo_wandered = Date.now();
      });
    }
  }, 1000);

  window.setInterval(function() {
    think(function() { 
      hobo_preaching = true;
      window.setTimeout(function() {
        hobo_preaching = false;
      }, (50 * truth.length) + 2000);
      hobo_thought = Date.now(); 
    }); 
  }, 10000);

  window.addEventListener('keydown', keydown, false);
  window.addEventListener('keyup', keyup, false);
  window.addEventListener('resize', resize, false); resize();
  window.requestAnimationFrame(draw);
};
