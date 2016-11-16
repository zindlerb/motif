// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';

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
        if (baseAttrs.displayType) {
            this.children = [];
        }

        this.attrs = baseAttrs;
        this.name = name;
    }
}

class Container {
    constructor() {
        super("container", {
            display: "container"
        });
    }
}




// Search component created as a class
class Search extends React.Component {

    // render method is most important
    // render method returns JSX template
    render() {
        return (
            <form>
                <input type = "text" />
                <input type = "submit" />
            </form>
        );
    }
}

// Render to ID content in the DOM
ReactDOM.render( < Search / > ,
                 document.getElementById('content')
);
