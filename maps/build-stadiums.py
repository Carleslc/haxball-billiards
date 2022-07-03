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

def bot_maps(stadiums):
  mappings = [];

  for stadium in stadiums:
    defaultName = stadium.upper().replace(' ', '_')

    name = CONFIG['tags'].get(stadium, defaultName) if 'tags' in CONFIG else defaultName

    with open(f'output/{stadium}.hbs', 'r') as raw_stadium_file:
      raw_stadium = raw_stadium_file.read()
      mappings.append((name, raw_stadium))

  map_names = '", "'.join(stadiums)
  maps = f"const MAP_NAMES = [\"{map_names}\"];\n"

  maps_values = ',\n\n  '.join(map(lambda mapping: f'{mapping[0]}: `{mapping[1]}`', mappings))
  maps += f'\nconst MAPS = {{\n  {maps_values}\n}};\n'

  banner = '// Source: haxball-billiards/maps\n// Generated with: python build-stadiums.py billiards.yml --raw';

  write_output('../bot/src/maps.js', f'{banner}\n\n{maps}');

if __name__ == "__main__":
  global CONFIG

  set_args()

  with open(args.config, 'r') as config:
    CONFIG = yaml.full_load(config)
  
  stadiums = CONFIG['stadiums']

  for stadium in stadiums:
    build_stadium(stadium)

  if args.raw:
    bot_maps(stadiums)
