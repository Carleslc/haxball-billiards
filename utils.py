import json

def pprint(o):
  print(json.dumps(o, indent=2, default=str))

def json_entry(e):
  return f'{{ {json.dumps(e)[1:-1]} }}'

def write_output(file, output_str):
  with open(file, 'w') as output:
    output.write(output_str)
  
  print('Output: ' + file)
