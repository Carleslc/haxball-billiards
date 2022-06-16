import re
import json
import yaml
import argparse

from utils import json_entry

def set_args():
  global args
  parser = argparse.ArgumentParser(description="Generate different stadiums from a template")
  parser.add_argument("config", help="stadium configuration .yml file")
  args = parser.parse_args()

def var(stadium, name, default=None):
  value = default
  if stadium in CONFIG['variables']:
    var_dict = CONFIG['variables'][stadium]
    if name in var_dict:
      value = var_dict[name]
  if value is None:
    value = CONFIG['variables']['defaults'][name] or { 'raw': '' }
  if type(value) is dict:
    if 'raw' in value:
      return str(value['raw'])
    return json_entry(value)
  return json.dumps(value)

def stadium_variables(stadium, prefix=''):
  variables = { f'{prefix}{name}': var(stadium, name) for name in CONFIG['variables']['defaults'] }
  variables[prefix + 'name'] = var(stadium, 'name', f"{stadium} (by {CONFIG['author']})" if CONFIG.get('author') else stadium)
  return variables

def replace(s, variables):
    pattern = re.compile('|'.join([re.escape(k) for k in sorted(variables, key=len, reverse=True)]), flags=re.DOTALL)
    return pattern.sub(lambda m: variables[m.group(0)], s)

def build_stadium(stadium):
  with open(CONFIG['template'], 'r') as template_file:
    template = template_file.read()
  
  contents = replace(template, stadium_variables(stadium, prefix='$'))

  output_file = f'output/{stadium}.hbs'
  
  with open(output_file, 'w') as output:
    output.write(contents)
  
  print(output_file)

if __name__ == "__main__":
  global CONFIG

  set_args()

  with open(args.config, 'r') as config:
    CONFIG = yaml.full_load(config)

  for stadium in CONFIG['stadiums']:
    build_stadium(stadium)
