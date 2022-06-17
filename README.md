# HaxBall Billiards

[HaxBall](https://www.haxball.com/play)

## 🎱  ⚪️⩴ ⚜️ Billiards ⚜️ 🔴🔵 𓀙

[Download Map (HaxMaps)](https://haxmaps.com/map/13561)

8 Ball with aiming line and space / shift / x for speed.
Default movement is slow for precision.

### Basic Rules

- 𓀙 One shot each player
- 🔴🔵 Score the balls with the same color as your player
- 🏵 If you score you shot again
- ⚫️ Scoring black must be the last one or you lose
- ⚪️ Scoring white is _foul_

_Fouls_ are 2 turns for the opponent's team (if they do not commit another foul)

### Extended Rules

These are standard billiard rules you can apply in HaxBall too if desired.

- Foul when you do not touch any ball of your team
- Foul when you touch first a ball of opponent's team
- Foul if you shot the ball when balls are still moving
- After scoring the white ball you must shot to the right, from the 1/4 left part of the table (kickoff area)
- Black, the last ball, must be scored in the opposite hole of your last scored ball. You lose scoring in another hole.
- You lose if you score the white ball right after the black with the same shot.

## Resources

### [Stadium Editor](https://haxball-stadium-editor.github.io/)

Use this editor to prototype your map visually. Then you can save the `.hbs` file in _Text Mode_.

### [.hbs Documentation](https://github.com/haxball/haxball-issues/wiki/Stadium-(.hbs)-File)

Learn about the `.hbs` format and the available properties.

### [Collision Flags](https://github.com/haxball/haxball-issues/wiki/Collision-Flags)

Learn about the collision flags `cMask` and `cGroup` to determine which objects collide with each other.

### [Billiards physical properties](https://billiards.colostate.edu/faq/physics/physical-properties/)

Physics empirical properties for billiards.

## Build

Install [Python 3](https://www.python.org/downloads/) and dependencies:

`pip install --upgrade -r requirements.txt`

Generate all billiard maps in `output` folder.

**`python build-stadiums.py billiards.yml`**

- **Billiard.hbs** Default map with standard pool physics and a line for aiming. Press SPACE, SHIFT or X to move around fast. Then use the normal movement to aim your shot. All of the following maps are special cases of this map. Most common billiards green background.

- **Billiard Practice.hbs** A practice map with only white and black balls. White ball can be moved slightly to prepare your practice shot.

- **Billiard Tournament.hbs** A professional mode without aiming help. Slightly modified physics for a bit more wall bouncing. Intended for tournament matches. Tournament blue background.

- **Billiard Carambola.hbs** A more aggressive map without aiming help, with smaller balls, more player shift speed and more kick strength, enough force to bounce 3 walls in a single shot without obstacles. Useful for usage of table wall indicators and _carambole / carom_ effects. Still have pockets to play normal pool games. Recommended for extended rules. Burgundy red background.

## Development

#### **`Billiard Template.hbst`**

Template for the billiard stadiums.

#### **`billiards.yml`**

Configuration file for the `build-stadiums` tool.

**Attributes**

- `template`: Template file. `.hbst` is not an official format of HaxBall. It is a jsonc (JSON with comments) format with `$variables`.
- `author`: Author of the stadiums
- `stadiums`: A list of all stadium names to build
- `variables`: Variable definitions to be replaced in the template file. Variables are names prefixed with an `$` (for instance `$name` value for the stadium name)
  - `defaults`: List of variables to replace in the template, providing a default value.
  - Other mappings with names of `stadiums` list to override default variables for specific stadiums.

Variable values follow the YAML format and they will be automatically converted to JSON (for the `.hbs` stadium file). You can add text (strings), numbers (integers or floats), lists and objects.

Object mappings can also be inherited and overriden from _defaults_ or other stadium variables, using the `extends` attribute with `defaults` or an stadium name.

You can skip the JSON conversion to write values as raw strings providing a `raw` attribute with the string to replace the variable with. This may be useful to build non scalars, for instance to write `// ` to insert comments instead the JSON formatted string `"// "`.

## Tools

### `build-stadiums`

Generate multiple stadium maps given a template file and a configuration file with variable definitions.

```
usage: build-stadiums.py [-h] config

Generate different stadiums from a template

positional arguments:
  config      stadium configuration .yml file

options:
  -h, --help  show this help message and exit
```

Example: `python build-stadiums.py billiards.yml`

### `vertex-add-cords`

Sometimes you want to increment or decrement the x, y coordinates of some of your vertexes. This is very daunting to do manually, so just copy to your clipboard the vertexes you want to edit and then execute this tool.

```
usage: vertex-add-cords.py [-h] [--x X] [--y Y] [--abs] [--file]

Increment x, y in a list of vertexes from the clipboard

options:
  -h, --help  show this help message and exit
  --x X       x increment
  --y Y       y increment
  --abs       increment the absolute value, ignoring sign
  --file      write output to a file
```

Example: `python vertex-add-cords.py --y 1`

This will give you the updated vertexes with an increment of 1 for all vertexes of your clipboard (move down 1 px).

### `order-vertex`

Sometimes you want to reorder, add or remove some vertexes, but you want to insert them between others, so segment vertexes will be incorrectly tagged afterwards because vertexes ids are they index order position.

Editing manually all segments and modifying comments with vertexes ids may be exhausting. You can use this tool to automatically get an updated version of your vertexes and segments.

Execute this tool before applying your changes, then edit the vertexes in the stadium file and press ENTER.

You can also split and group your vertexes and segments by trait.

```
usage: order-vertex.py [-h] [--file] [--split SPLIT [SPLIT ...]] stadium

Reorder and update vertexes and synchronize segments accordingly

positional arguments:
  stadium               stadium .hbs file to read

options:
  -h, --help            show this help message and exit
  --file                write output to a file (not the stadium file)
  --split SPLIT [SPLIT ...]
                        add a new line every n vertices/segments of trait, example: tableWall:12/6 bgIndicator:4/4
```

Example: `python order-vertex.py "Billiard Template.hbst" --file --split tableWall:12/6 bgIndicator:4/4`

This will give you the updated vertexes and segments edited manually from `Billiard Template.hbst` file. They will be grouped in 12 vertexes and 6 segments for _tableWall_ trait and 4 vertexes and segments for _bgIndicator_ trait. Vertexes with the same trait should be together to work properly.
