export function array_difference(old_array, new_array) {
  return {
    added_items: new_array.filter((item) => !old_array.includes(item)),
    removed_items: old_array.filter((item) => !new_array.includes(item)),
  };
}

export function object_difference(old_object, new_object) {
  let old_keys = Object.keys(old_object);
  let new_keys = Object.keys(new_object);

  return {
    added_items: new_keys.filter((key) => !(key in old_object)),
    removed_items: old_keys.filter((key) => !(key in new_object)),
    updated_items: new_keys.filter((key) => {
      return (key in old_keys) && (old_object[key] !== new_object[key]);
    })
  };
}