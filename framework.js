function virtual_node__element(element_tag, element_props = {}, element_children = []) {
  return {
    "type": "element_node",
    "element_tag": element_tag,
    "element_props": element_props,
    "children": element_children
  }
}

function virtual_node__text(text) {
  return {
    "type": "text_node",
    "text": text
  }
}

function virtual_node__fragment(fragment_children = []) {
  return {
    "type": "fragment_node",
    "children": fragment_children
  }
}

function Observer() {
  this.subscriptions = {}
  this.finalizers = []
}

Observer.prototype.subscribe = function (command_name, command_resolver) {
  
  if (!this.subscriptions.hasOwnProperty(command_name)) {
    this.subscriptions[command_name] = []
  }

  let command_resolvers = this.subscriptions[command_name];
  if (command_resolvers.includes(command_resolver)) {
    return () => {};
  } else {
    command_resolvers.push(command_resolver);
    return () => {
      command_resolvers.splice(
        command_resolvers.indexOf(command_resolver), 1
      );
    };
  }

} 

Observer.prototype.add_finalizer = function (finalizer) {
  if (this.finalizers.includes(finalizer)) {
    return () => {};
  } else {
    return () => {
      this.finalizers.splice(
        this.finalizers.indexOf(finalizer), 1
      );
    }
  }
}

Observer.prototype.dispatch = function (command_name, command_payload) {
  if (this.subscriptions.hasOwnProperty(command_name)) {
    this.subscriptions[command_name].forEach((command_resolver) => {
      command_resolver(command_payload);
    });
  }
  this.finalizers.forEach((finalizer) => finalizer());
}



function add_events_dictionary(dom_element, events_dictionary) {
  Object.entries(events_dictionary).forEach(
    ([event_name, event_handler]) => {
      dom_element.addEventListener(event_name, event_handler);
    }
  )
}

function remove_events_dictionary(dom_element, events_dictionary) {
  Object.entries(events_dictionary).forEach(
    ([event_name, event_handler]) => {
      dom_element.removeEventListener(event_name, event_handler);
    }
  )
}

function set_class_array(dom_element, class_array) {
  dom_element.classList.add(...class_array);
}

function remove_classes(dom_element) {
  dom_element.className = null;
}

function set_attributes(dom_element, props) {
  let { classes, on, ...other_attributes } = props;
  for (let [attribute_name, attribute_value] of Object.entries(other_attributes)) {
    // dom_element.setAttribute(attribute_name, attribute_value);
    dom_element[attribute_name] = attribute_value;
  }
}
function remove_attributes(dom_element, props) {
  let { classes, on, ...other_attributes } = props;
  for (let [attribute_name, attribute_value] of Object.entries(other_attributes)) {
    // dom_element.removeAttribute(attribute_name, attribute_value);
    dom_element[attribute_name] = null;
  }
}

function mount_DOM(virtual_dom_node, parent_dom_element) {
  switch (virtual_dom_node["type"]) {
    case "fragment_node": {
      virtual_dom_node.dom_element = parent_dom_element;
      virtual_dom_node["children"].forEach((child) => mount_DOM(child, parent_dom_element));
      break;
    }
    case "element_node": {
      let element_node = document.createElement(virtual_dom_node["element_tag"]);
      virtual_dom_node.dom_element = element_node;
      parent_dom_element.append(element_node);

      add_events_dictionary(element_node, virtual_dom_node["element_props"]["on"]);
      set_class_array(element_node, virtual_dom_node["element_props"]["classes"]);
      
      set_attributes(element_node, virtual_dom_node["element_props"]);

      virtual_dom_node["children"].forEach((child) => mount_DOM(child, element_node));

      break;
    }
    case "text_node": {
      let text_node = document.createTextNode(virtual_dom_node["text"]);
      virtual_dom_node.dom_element = text_node;
      parent_dom_element.append(text_node);

      break;
    }
  }
}

function destroy_DOM(virtual_dom_node) {
  switch (virtual_dom_node["type"]) {
    case "fragment_node": {
      virtual_dom_node["children"].forEach((child) => destroy_DOM(child));
      break;
    }
    case "element_node": {
      virtual_dom_node["children"].forEach((child) => destroy_DOM(child));

      remove_classes(virtual_dom_node.dom_element);
      remove_events_dictionary(virtual_dom_node.dom_element, virtual_dom_node["element_props"]["on"]);

      remove_attributes(virtual_dom_node.dom_element, virtual_dom_node["element_props"]);

      virtual_dom_node.dom_element.remove();

      break;
    }
    case "text_node": {
      virtual_dom_node.dom_element.remove();
      break;
    }
  }
  delete virtual_dom_node.dom_element;
}

function App({ state, view, reducers = {} }) { 
  this.state = state;
  this.view = view;
  
  this.parent_dom_element = null;
  this.virtual_dom_root = null;
  
  this.observer = new Observer();
  this.handlers = [this.observer.add_finalizer(this.render_app)];

  for (let reducer_name in reducers) {
    this.handlers.push(
      this.observer.subscribe(reducer_name, (command_payload) => {
        this.state = reducers[reducer_name](this.state, command_payload);
        this.render_app();
      })
    );
  }
}


App.prototype.emit = function(command_name, command_payload) {
  this.observer.dispatch(command_name, command_payload);
}


App.prototype.render_app = function() {
  if (this.virtual_dom_root) {
    destroy_DOM(this.virtual_dom_root);
  }

  emit = (command_name, command_payload) => {
    this.emit(command_name, command_payload);
  }

  this.virtual_dom_root = this.view(this.state, emit);
  mount_DOM(this.virtual_dom_root, this.parent_dom_element);
}

App.prototype.mount = function (parent_dom_element) {
  this.parent_dom_element = parent_dom_element;
  this.render_app();
}

App.prototype.unmount = function () {
  destroy_DOM(this.virtual_dom_root);
  this.virtual_dom_root = null;
  this.handlers.forEach((handler) => handler());
}