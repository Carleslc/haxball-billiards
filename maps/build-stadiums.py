import re
import json
import yaml
import argparse

from utils import json_entry, json_compress, write_output

def set_args():
  global args
  parser = argparse.ArgumentParser(description="Generate different stadiums from a template")
  parser.add_argument("config", help="stadium configuration .yml file")
  parser.add_argument("--raw", action='store_true', help="Compress stadiums for production (uglify) in output folder")
  args = parser.parse_args()

def inherit(value, name):
  parent = value['extends']
  extends = CONFIG['variables'][parent]
  parent_value = extends[name]

  if type(parent_value) is not dict:
    return parent_value
  
  child = parent_value.copy()

  if 'extends' in parent_value:
    child = inherit(parent_value, name) # hierarchical inheritance

  for key, child_value in value.items():
    if key != 'extends':
      child[key] = child_value
  
  return child

def var(stadium, name, default=None):
  value = default

  if stadium in CONFIG['variables']:
    var_dict = CONFIG['variables'][stadium]
    if name in var_dict:
      value = var_dict[name]
  
  if value is None:
    value = CONFIG['variables']['defaults'][name]

    if value is None:
      value = { 'raw': '' }
  
  if type(value) is dict:
    if 'raw' in value:
      return str(value['raw'])
    
    if 'extends' in value:
      value = inherit(value, name)

      if type(value) is not dict:
        return json.dumps(value)
    
    if 'enable' in value:
      if value['enable'] == False:
        return '// '
      
      value = value.copy()
      del value['enable']

      if not value:
        return ''
    
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
  
  if args.raw:
    print('RAW: ', end='')
    write_output(f'output/{stadium}.hbs', json_compress(contents))
  else:
    write_output(f'stadiums/{stadium}.hbs', contents)

if __name__ == "__main__":
  global CONFIG

  set_args()

  with open(args.config, 'r') as config:
    CONFIG = yaml.full_load(config)

  for stadium in CONFIG['stadiums']:
    build_stadium(stadium)
