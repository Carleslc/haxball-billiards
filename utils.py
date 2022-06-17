import re
import json
import pyjson5

def pprint(o):
  print(json.dumps(o, indent=2, default=str))

def write_output(file, output_str):
  with open(file, 'w') as output:
    output.write(output_str)
  
  print('Output: ' + file)

def json_entry(e):
  return f'{{ {json.dumps(e)[1:-1]} }}'

def json_slice(s, key):
  pattern = re.compile(rf'"{key}"\s*:\s*(\[.*?])', flags=re.DOTALL)
  match = pattern.search(s)
  if not match:
    return []
  start, end = match.span(1)
  return pyjson5.loads(s[start:end])
