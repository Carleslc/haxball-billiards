import pyjson5 # json with comments
import argparse

from utils import json_entry, json_slice, write_output

def set_args():
  global args
  parser = argparse.ArgumentParser(description="Reorder and update vertexes and synchronize segments accordingly")
  parser.add_argument("stadium", help="stadium .hbs file to read")
  parser.add_argument("--file", action='store_true', help="write output to a file (not the stadium file)")
  parser.add_argument("--split", help="add a new line every n vertices/segments of trait, example: tableWall:12/6 bgIndicator:4/4", nargs='+')
  args = parser.parse_args()

def get_stadium(file):
  with open(file, 'r') as stadium_file:
    stadium_contents = stadium_file.read()
  try:
    stadium = pyjson5.loads(stadium_contents)
  except pyjson5.Json5IllegalCharacter:
    # illegal json values like $variables in a .hbst file
    stadium = {
      'vertexes': json_slice(stadium_contents, 'vertexes'),
      'segments': json_slice(stadium_contents, 'segments'),
    }
  return stadium

def vertex(v):
  return (attr for attr in v)

def index_to_vertex(stadium):
  return dict(map(lambda i_v: (i_v[0], vertex(i_v[1])), enumerate(stadium['vertexes'])))

def vertex_to_index(stadium):
  vertexes = {}
  
  for i, v in enumerate(stadium['vertexes']):
    v = vertex(v)
    
    if v in vertexes:
      print(f'Vertex {i} {v} is duplicated: {vertexes[v]}')
    else:
      vertexes[v] = i
  
  return vertexes

def json_entry_wrapper(_, e):
  return json_entry(e)

def json_entries(key, entries, map_entry=json_entry_wrapper, split_groups=None):
  len_e = len(entries)
  trait = None

  split_i = 0
  entries_str = f'  "{key}": [\n'

  for i, v in enumerate(entries):
    split_n = split_groups.get(v.get('trait'), 0) if split_groups else 0

    if 'trait' in v and v['trait'] != trait:
      trait = v['trait']
      split_i = 0
      split = True
    else:
      split_i += 1
      split = split_n and split_i % split_n == 0
    
    if split and i > 0:
      entries_str += '\n' # spacing
    
    entries_str += '    ' + map_entry(i, v)

    if i < len_e - 1:
      entries_str += ','
    entries_str += '\n'
  
  entries_str += '  ]'

  return entries_str

def vertexes_str(vertexes):
  return json_entries('vertexes', vertexes, lambda i, v: f'/* {i} */ {json_entry(v)}', split_groups(0))

def update_segments(old_stadium, new_stadium):
  old_index = index_to_vertex(old_stadium)
  new_vertexes = vertex_to_index(new_stadium)

  diff = len(new_stadium['vertexes']) - len(old_stadium['vertexes'])

  if diff > 0:
    print(f'{diff} vertexes added')
  elif diff < 0:
    print(f'{abs(diff)} vertexes removed')

  def updated_vertex(v):
    return new_vertexes[old_index[v]]

  def updated_segment(_, s):
    try:
      s['v0'] = updated_vertex(s['v0'])
      s['v1'] = updated_vertex(s['v1'])
    except KeyError:
      return '// ' + json_entry(s) # comment segment if some vertex is missing (removed)

    return json_entry(s)

  return json_entries('segments', old_stadium['segments'], updated_segment, split_groups(1))

def split_groups(i):
  split = {}

  if args.split:
    for split_group in args.split:
      split_parts = split_group.split(':')
      trait = split_parts[0]
      split_n = 0

      if len(split_parts) > 1:
        split_n_groups = split_parts[1].split('/')
        split_n = split_n_groups[i] if len(split_n_groups) > i else split_n_groups[-1]
      
      split[trait] = int(split_n)
  
  return split

if __name__ == "__main__":
  set_args()

  old_stadium = get_stadium(args.stadium)

  input("Reorder vertexes and press ENTER") # wait
  print()

  new_stadium = get_stadium(args.stadium)

  # pprint(dict(map(lambda v_i: (str(v_i[0]), v_i[1]), enumerate(vertexes))))

  v_str = vertexes_str(new_stadium['vertexes'])
  s_str = update_segments(old_stadium, new_stadium)

  output_str = f'{v_str},\n\n{s_str},\n'

  if args.file:
    write_output('output/order-vertex.json', output_str)
  else:
    print()
    print(output_str)
