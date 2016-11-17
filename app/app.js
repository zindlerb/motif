// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

// Base Components

/* 

  Attrs:
    displayType:
       container | content | inline (goes inside content)
    
  
    What must the super div satisfy:
      - must be able to build up bootstrap and other up component library primatives
      - must be as simple as possible without losing the power of all the other div props
      - must be built with responsiveness in mind from the beginning
      - simple means of aligning in both directions...

   What properties are used for layout?
     - float, clearfix
     - width: 100%; max, min 
     - height % min max
     - flex
     - upcoming grid
     - relative + absolute + fixed
     - margin: auto;
     - media queries

     - important concepts:
       - parent child relationship
         - how big is my parent?
         - how is my parent positioned?
         - what is my parents layout style
       - the nature of the content inside the element

     need to simplify overflow..
     
     possible idea:
       - layered doms - just put a dom on top of another one...
          - how would the scrolling work?
          - how is a paralax done?
       - 


 */

class ComponentBaseClass {
    constructor(name, baseAttrs) {
        this.attrs = baseAttrs;
        this.name = name;
    }
}

class Container extends ComponentBaseClass {
    constructor(attrs, children) {
        super("container", Object.assign({}, attrs, {
            display: "container"
        }));

        this.children = children || [];
    }

    render() {
        var sx = {
            
        }

        var children = _.map(this.children, function (child) {
            return child.render();
        });
        
        
        return (
            <div style={sx}>
                {children}
            </div>
        )
    }
}


class Text extends ComponentBaseClass {
    constructor(attrs) {
        super("text", Object.assign({}, attrs, {
            display: "content"
        }));
    }

    render() {
        var sx = {
            
        }
        
        return (
            <p style={sx}>
                {this.attrs.text}
            </p>
        )
    }
}



class Header extends ComponentBaseClass {
    constructor(attrs) {
        super("header", Object.assign({}, attrs, {
            display: "content"
        }));
    }

    render() {
        var sx = {
            
        }

        return (
            <h1 style={sx}>
                {this.attrs.text}
            </h1>
        )
    }
}


class Image extends ComponentBaseClass {
    constructor(attrs) {
        super("image", Object.assign({}, attrs, {
            display: "content"
        }));
    }

    render() {
        var sx = {
            
        }

        return (
            <img style={sx} src=""/>
        )
    }
}

// Search component created as a class
class StaticRenderer extends React.Component {

    constructor() {
        super();
        this.state = {
            elements: new Container(
                {},
                [
                    new Header({text: "I am a header"})
                ]
            )
        }

        console.log(this.state.elements)
    }
    
    render() {
        return (
            <div>
              {this.state.elements.render()}
            </div>
        );
    }
}

// Render to ID content in the DOM
ReactDOM.render( < StaticRenderer / > ,
                 document.getElementById('content')
);
