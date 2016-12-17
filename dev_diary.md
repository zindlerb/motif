# Motif Dev Diary

## Dec 1

Today I need to step back and look at the design decisions of the client state. I need to look at how to structure the client state.

- how to structure client state
- how to change client state

For structurung the client state I think my initial proposal was too deeply nested. I need to normalize my state.

What are the tradeoffs of normalization?

Pros:
- When the data is flat it can be serialized more easily no circular dependencies
- Easier to debug?

Cons:
- In order to follow the 'links' in normalized data you need to have the whole data map at your disposal to look up the ids.
- Presentation of the data can often involve denormalizing it and this has performance and complexity costs. ex. I need 2 pieces of data instead of 1 render something now.

Normalization is linked with immutability - if you are dealing with immutable values you basically need to normalize

https://github.com/paularmstrong/normalizr
https://groups.google.com/forum/#!topic/reactjs/jbh50-GJxpg


Redux Notes:
Redux seems cool but the amount of hype makes me paranoid

Containers vs. Components -

"I call components encapsulated React components that are driven solely by props and don't talk to Redux. Same as “dumb components”. They should stay the same regardless of your router, data fetching library, etc.

I call containers React components that are aware of Redux, Router, etc. They are more coupled to the app. Same as “smart components”."

https://github.com/reactjs/redux/issues/756
- Dan Ambromov

In redux the mapStateToProps de-normalizes the data as it goes into the app. This has a performance cost but does that matter?

The perf cost is linear time with the amount of data often time unzipping ids. Not true! if there is a list that is normalized you have to render it anyway and walk through it linear time...

Then the question becomes how often does the react component render?
Also does normalization allow the prevention of re-renders? How would it do that?

- look at how connector works - why do containers have own props?

In the real world example the containers have props due to routes...

- fix mental model of rendering

Because of the way that react renders - any parent change causes a full re-render. Using a single store basically requires some form of immutability.
Otherwise any change is re-rendering the whole tree...

- check if state can be updated in render and what happens

When you mutate state in a redux render it updates the state. Redux does not protect you from mutation inside the render functions.. There would be a way to issue a warning in dev using middleware maybe?

- Read through om next articles

I should probably keep settings of panels and minmimization at the top level so it can be serialized and stored.

Walking the whole dom tree will be the big performance hit. On a drag how can I prevent walking the whole dom tree?

There should be a way of plucking off a node and only rendering that node...

That will require a deep understanding of react.

For dynamically rendered layouts in react how do you partially render the tree?
- the only way to prevent consistent linear scans is when you change the data you change the dom at the same time I think.


I think the way to go is redux with possibly 2 stores in the future one mutable and one immutable.

And use the immutable one for the tree view if the performance is an issue.

Reasons:
- normalization + immutability allows single store which is nice.
- single store does not work without those things because perf would be so bad!!
- convenience functions for actions are really nice.

I think I will have to mutate the component tree....

could test. if it is 4000 nodes how long does a clone take?
2ms for 4000 clone of obj.

But space complexity may be more of an issue.

Next:
- Come up with clear list of mvp requirements
- Read through aparatus and understand it more deeply
- Come up with normalized state
- Add in redux to app + remove immutable
- Add dragging to add

later:
- fix emacs annoyances
- do full redux tutorial
- read redux source
- read general vibe on how to handle async in redux
- read full electron api

Need to start cranking on features

It seems the cloning does not cause a major perf hit. I think for now I will forgo the splitting.

Make decision on:
- Redux, Normalize

I think the only remaining question is:
- redux or no redux
   - if no redux do I still normalize

Things the answer depends on:
- how will I do collaboration? does that depend on state snapshotting?
- what actual benefits does redux provide?

For data should it just be classes with methods attached? Or pure objects?


## Dec 2

MVP Spec:
Need mocks for all of these



Component Inheritance:
- Components inherit traits and children from their component block.
- Components can override the traits of their component block
- Components can create a new component block from themselves. This severs their relationship with their old component block and creates a new component block they inherit from.
- If a new component block is created the children still inherit from their old component block.
- Copy and paste just creates a new component with the same values as the one copied in a different location.
- Component blocks can have no name clashes
- Components as a child can have a abstract child containter. This means other elements can be dragged and dropped inside it. If no are there no new children? If children are also inherited that does not work...
- Works like aparatus with single inheritance

Transitions:
- Set:
  - delay
  - transition time
  - how the transition is eased
  - What property
  - What state
- UI:
  - Have little transition option next to properties that allow it - on states does when transitioned to on default does when created? default will need to provide a base case...

CSS Notes:
- In css it is not pure bottom up or bottom down.
  - blocks grow to fit their parent inline grow to fit


Next:
- Settle open design Questions:
  - Q: How will text editing work? How will inline things like links or images work? We have no float here....
    - A: For now jst do content editable and not float. When trying to build layouts that merge the text and images then take notes. Will need link and bold
  - Q: How do I do the flexbox sizing?
    - A: Do vanilla flex and iterate
- Read through aparatus data model. List out pros and cons of archetecture
- Do normalized and un normalized data model of data
- Decide on redux vs. vanilla flux
- Begin writing full app going through all features


Questions for later:
- How to constrain the editing interface - communicate to component user that this component is meant to be used a certain way.
  - Can only be this color, is these 3 sizes, this is constant text this is changeable text
- How to make sure the site is semantic?
- How to make sure the site is accessible?
- How to group components? Should allow folders of some kind?
- How to make modals
  - I think a simple boolean state for components will be sufficient...
- How to do forms?
- Site templates?
- Boolean components? Set custom states for diff views but that would require multi states?

Example Workflows:
- Build button from primatives
- Make header component using button
- Take button and alter it - turn that into new button component

## Dec 5th:
Did architecture analysis and go too bogged down thinking about performance and how to set things up. In the future I need to work towards finishing a basic prototype and then worrying about performance. It is too hard to know how to structure things for performance before anything is implemented.

I suspect perf hits will come from building the element tree for the page views. I might need to make a react like thing with a eventing api not a declarative one. But honestly that is a waste of time now. I need to clear the fog of war first.

I need to keep it dead simple and slow. And then when one pass of the app is done optimize it for performance.

Tomorrow I need to crank on some features.

## Dec 6th:
Did the dragging of components and many other minor features. I got a little distracted reading internet articles mid-day. My emacs is also crashing at annoying times. Maybe I should consider switching editors... or just fixing a bunch of the minor emacs annoyances I currently have...

## Dec 7th:
Added attr editing and linting.

## Dec 8th:
I need to re-architect the component code to support sophisticated dragging.
https://facebook.github.io/react/blog/2015/12/18/react-components-elements-and-instances.html

Notes on react terminology:
Component:
from React.createClass()
Must take props as input and give elements as output.

Element:
from React.createElement(type, prop, children) - https://facebook.github.io/react/docs/react-api.html#createelement
Describes component instance or dom element.
Immutable object describing what you want to see.
Type of element can be string or react component.
Create element is just syntactic sugar over obj representation. Elements are just objects

Instance:
The instance here is tied to a dom node. Only components with classes have instances. React creates the instances. You cannot create them. Access the instance through a ref.

Reconciliation:
Process of resolving components and props to base elements.
Finds min number of ops to trasform one tree into another

"React implements a heuristic O(n) algorithm based on two assumptions:

Two elements of different types will produce different trees.
The developer can hint at which child elements may be stable across different renders with a key prop."



Rendering:

- Build new element tree.
- Diff element tree with old one to find out mutations to make.
- Make min mutations to dom.

How are elements matched to instances?
- iterates through both new and old children at the same time. Does same element comparison. Since it goes top to buttom if top element is changed it needs to mutate all. By providing keys elements don't have to be compared from top to bottom

Related why are keys needed?
"As a last resort, you can pass item's index in the array as a key. This can work well if the items are never reordered, but reorders will be slow."
https://facebook.github.io/react/docs/reconciliation.html

In the current implementation, you can express the fact that a subtree has been moved amongst its siblings, but you cannot tell that it has moved somewhere else. The algorithm will rerender that full subtree." - Bad for my app

"The algorithm will not try to match subtrees of different component types. If you see yourself alternating between two component types with very similar output, you may want to make it the same type. In practice, we haven't found this to be an issue.

Keys should be stable, predictable, and unique. Unstable keys (like those produced by Math.random()) will cause many component instances and DOM nodes to be unnecessarily recreated, which can cause performance degradation and lost state in child components."

When does mounting and unmounting happen?
- If a component subtree is rebuilt is it remounted?

## Dec 9th:
Problems with direct manipulation of html:
- Layers - elements covering other elements
  - In scenegraph view need to be able to reorder tree
- Deeply nested trees
  - Why bad? - not actually so bad
- Small elements
  - Need to expand

- write algo for expanding on drag
- write algo for expanding on near
- add tree view

## Dec 13th:
What makes css hard to learn?
- Cannot inspect or debug behaviour - esp. with layouts
- Tons of properties with silent conflicts
  - height: 100%
    - creates a height but is still 0 because the parent is 0.
- Indirection - poor feedback loop with changes
- Html and Css are tied together but there is no good abstraction for this

When people build websites what kinds of things are they trying to specify?

Principles:
- enforce correctess - and explain why
- simplify primatives
- show the behaviour of the system
- direct manipulation



Min/Max Width:
- Describes the bounds of growing and shrinking for a element

Flex Grow/Shrink:
- When I exceed or go below my width or height describes how the element should behave. In relation to the other elements

## Dec 14th:

Design day.

TD:
- Read Shape of design ch.1 again
- Lay out why of app. What are principles app should adhere to.
- Do full mocks of building slack website focus only on behaviour and usability
  - Figure out how to design for size - what does resolution have to do with it? how can I mimic what user will really see?
- Keep looping through slack mocks until they look good and all behaviour is clearly specified
- Features that are non essential should be removed.

Why:
Making web pages is either too complicated or disempowering.
Often the designer of the page cannote actually make and deploy their page.
Web pages don't leverage the power of computers (later)

How:
Creator must have a direct connection to the work. Directly see the behaviour of the system.

There must be less primatives and the primatives must compose better

The system must engourage learning. Cleary communicate mistakes and why. Guide the user to become more powerful.

The system must encourage scaling

Overall:
The web as a material that can be worked with and 'felt'


Width and Height Spec:

default: content, or 100% depending on the direction

fill: grows to fill the remaining space in the main axis.

What if only main size and cross size where manipulated?
- would make more conceptual sense for the filling but switching column to row or reverse would be strange


Cross Axis Default:
- fill 100%;

Main Axis Default:
- fill content.


specified both width and height makes it simpler with w and h
unspecified main makes it easer to understand with cross main
unspecified cross makes it easier to understand with cross and main..

either the behaviour switches or the numbers specified switch their meaning...


Specify by height and width?

Why is there a diff in treatment of main and cross?

what if they both 'filled'?


For now:
Specify:
- Height - min/max - default
- Width - min/max - default
- Fill Main Axis (off by default)


Punting on:
- Coming up with better names than the css ones
- Perfecting the 'look'
- Better panel mapping (this will require looking at the actual size)
- Background imagesn


How to proceed?
All concerns seem tangled. Hard to know the right way..


Need to figure out:
- Visualizing selected elements / Diff levels of attributes on elements
- Editing panel

- Dragging
- Direct editing of text
- Multiple views



What is needed to test these things out?

- All attrs in very basic form. No mapping.
  - Color pickers for color
  - Text fields for nums and text
  - Dropdowns

- Saving and loading of projects

- Atribute Panel:
  - Handle auto complete from style guide
  - Provide good mapping
  - Allow sketch and constrain
  - As uniform as possible... Minimize specialized ui
  - Everything must be labeled
  - As information dense as possible

- Selected Elements Visualization:
  - Show margin and padding - and values
  - Show width and height and what key it specifies to
  - show baseline somehow

- Dragging/Selecting:
  - handle overlapping drop spots
  - easy to see where to drop
  - easy to specify drop spot


First Nail selecting and dragging.

In order to test need to implement:
- Basic attribute panel - all atttributes just text field - add color picker for color
- Ability to make components - ability to delete components
- Ability to save and open projects
- Ability to add images


design of dragging.
selected element visualization.
look of all panels except attribute.
attribute panel







with real size

Design attribute panel for:
- small/big
- component with children

don't go through workflow just go through operations of selecting and changing

Good examples:
- empty div sandwiched somewhere
- tree in existing page
- component with children base components
- component with children components (go through changing)






selection
dragging
attribute panel
selected visualization


How can motif delight?


Before:
- Review why.
- Look up means of abstraction in sketch
