export function set_attributes(dom_element, props) {
  const { classes, styles, ...other_props } = props;
  
  if (classes) {
    dom_element.class_name = "";

    classes.forEach((class_name) => {
      dom_element.classList.add(class_name);
    });
  }

  if (styles) {
    Object.entries(styles).forEach(([style_name, style_value]) => {
      dom_element.style[style_name] = style_value;
    });
  }

  for (const [other_prop_name, other_prop_value] of Object.entries(other_props)) {
    dom_element[other_prop_name] = other_prop_value;
  }
}
