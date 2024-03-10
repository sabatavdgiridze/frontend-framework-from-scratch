export function add_event_listeners(event_listeners = {}, dom_element) {
  Object.entries(event_listeners).forEach(([event_name, event_handler]) => {
    dom_element.addEventListener(event_name, event_handler);
  });
}

export function remove_event_listeners(event_listeners = {}, dom_element) {
  Object.entries(event_listeners).forEach(([event_name, event_handler]) => {
    dom_element.removeEventListeners(event_name, event_handler);
  });
}
