# HaxBall Billiards

[HaxBall](https://www.haxball.com/play)

[.hbs Documentation](https://github.com/haxball/haxball-issues/wiki/Stadium-(.hbs)-File)

## Install

[Python 3](https://www.python.org/downloads/)

`pip install --upgrade -r requirements.txt`

## Build

Generate all billiard maps in `output` folder.

`python build-stadiums.py billiards.yml`

## Tools

`python build-stadiums.py -h`

```
usage: build-stadiums.py [-h] config

Generate different stadiums from a template

positional arguments:
  config      stadium configuration .yml file

options:
  -h, --help  show this help message and exit
```

Ejemplo: `python build-stadiums.py billiards.yml`

`python order-vertex.py -h`

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

`python vertex-add-cords.py -h`

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

# Billiards physical properties

https://billiards.colostate.edu/faq/physics/physical-properties/

diameter = 2.25 in = 5.71 cm
mass = 6 oz = ~170.1 g

damping (roll): 1 - rolling friction [μ] (0.005 ~ 0.015) = ~0.99
damping (slide): 1 - sliding friction [μ] (~0.2) = ~0.8

bCoef (coefficient of restitution [e])
  ball 0.92 ~ 0.98
  table 0.5
