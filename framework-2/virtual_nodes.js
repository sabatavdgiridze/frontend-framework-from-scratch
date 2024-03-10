export const virtual_node_types = {
  ELEMENT: "element",
  TEXT: "text",
  FRAGMENT: "fragment",
};

export function virtual_node__element(element_tag, element_props, element_children = []) {
  return {
    type: virtual_node_types.ELEMENT,
    element_tag,
    element_props,
    element_children,
  };
}

export function virtual_node__text(text_string) {
  return {
    type: virtual_node_types.TEXT,
    text_string,
  };
}

export function virtual_node__fragment(fragment_children) {
  return {
    type: virtual_node_types.FRAGMENT,
    fragment_children,
  };
}

export function virtual_nodes_equal(virtual_node_1, virtual_node_2) {
  if (virtual_node_1.type === virtual_node_2.type) {
    if (virtual_node_1.type === virtual_node_types.ELEMENT) {
      return virtual_node_1.tag === virtual_node_2.tag;
    }
    return true;
  }
  return false;
}