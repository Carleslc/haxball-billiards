import re
import json
import pyjson5

from pathlib import Path

def pprint(o):
  print(json.dumps(o, indent=2, default=str))

def write_output(file, output_str, print_file=True):
  output_file = Path(file)
  output_file.parent.mkdir(exist_ok=True, parents=True)
  output_file.write_text(output_str)
  if print_file:
    print(file)

def json_entry(e):
  return f'{{ {json.dumps(e)[1:-1]} }}'

def json_slice(s, key):
  pattern = re.compile(rf'"{key}"\s*:\s*(\[.*?])', flags=re.DOTALL)
  match = pattern.search(s)
  if not match:
    return []
  start, end = match.span(1)
  return pyjson5.loads(s[start:end])

def json_compress(contents):
  return pyjson5.dumps(pyjson5.loads(contents))
