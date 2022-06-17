import re
import clipboard
import argparse

from utils import write_output

def set_args():
  global args
  parser = argparse.ArgumentParser(description="Increment x, y in a list of vertexes from the clipboard")
  parser.add_argument("--x", type=int, help="x increment", default=0)
  parser.add_argument("--y", type=int, help="y increment", default=0)
  parser.add_argument("--abs", action='store_true', help="increment the absolute value, ignoring sign")
  parser.add_argument("--file", action='store_true', help="write output to a file")
  args = parser.parse_args()

COORDS_X = r'"x"\s*:\s*(-?\d+)'
COORDS_Y = r'"y"\s*:\s*(-?\d+)'

def increment(vertexes, x, y):

  def int_group(g):
    return int(g) if g else None
  
  def sign(n):
    return -1 if n < 0 else 1

  def group_span(m, i):
    start = m.start()
    return (m.start(i) - start, m.end(i) - start)

  def increment_match(i):
    def increment_match_i(m):
      s = m.group(0)
      g = m.group(1)

      if g and i:
        n = int_group(g)
        inc = i if not args.abs else i * sign(n)
        start_y, end_y = group_span(m, 1)
        s = s[:start_y] + str(n + inc) + s[end_y:]
      
      return s
    return increment_match_i
  
  vertexes = re.sub(COORDS_X, increment_match(x), vertexes)
  vertexes = re.sub(COORDS_Y, increment_match(y), vertexes)

  return vertexes

if __name__ == "__main__":
  set_args()

  if not args.x and not args.y:
    print("Provide --x or --y different than 0 to increment")
  else:
    vertexes = clipboard.paste()

    output_str = increment(vertexes, args.x, args.y)

    print("Modified clipboard:" if output_str != vertexes else "No change. Clipboard:")

    if args.file:
      write_output('output/vertex-add-cords.json', output_str)
    else:
      print()
      print(output_str)
