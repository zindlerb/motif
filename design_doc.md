# Motif Design Docs

## What is Motif?

A website designer.

## Why Motif?

There are no good authoring tools for webpages. Either the tools disempower or they require full knowledge of html css with some heavy gui over it.

Motif exists to:
- Simplify the primatives of authoring html css
- Show the behaviour of the system/get system knowledge out of head and into tool
- Let the creator directly connect with the creation. The user should 'feel' the page they are authoring as if it was a material.

## Q & A
- Why not webflow?

## Problems:
### Likely:
- Output will not be semantic. How to make the output more semantic.

### Possible:
- Will the inheritance as it stands create too long of inheritance trees and cause confusion?
- What if I drag out the child of a component and then edit the child on master?
  - should not update I think............. idk gotta try it to know

## Spec
Toolbar:
- new page
- open page
- export page
- import asset

Left Panel:
- Show hide left panel.

- Pages
  - View Pages
  - Create New Page
  - Select Page
  - Rename Pages

- Style Guide:
  (All values are addressed by name. Should only have values that might be changed.)
  - Set choices for:
    - Colors
    - Fonts
    - Typescale
    - Widths
    - Heights
    - Spacing
    - Breakpoints
  - Toggle style guide on and off for individual values

- Components
  - Drag components on to page
  - Go to Component View from component
  - Add new component -> go to component menu
  - Delete Component from sidebar
  - Delete all instances of a component optional message after selecting delete (V2)
  - Rearrange Components (V2)
  - Default Components:
    - Container
    - Paragraph
    - Header
    - Image
    - Video
    - Embed
    - Lists
    - Table (V2)
    - Forms (V2)
- Assets
  - Show all assets for project
  - Drag in asset to page
  - Add new asset
  - Open in finder
  - Search
  - Rename

Main Views:
- Component View
  - Scroll through diff component states
  - Edit individual component states (components are variants of default state diff of attrs)

- Page View
  - Re arrange components
  - Transform component into component generator (could possibly drag into sidebar (V2))
  - Select components
  - Delete component
  - Different levels of views
    - No view
    - Show width (fluid or fixed), padding, margin, inline or block
  - Change width
  - Change device
    - Choose breakpoint, or device grouping)
  - Edit Component (This editing does not propagate to the parent unless the user chooses to!!)
    - Edit text
    - Edit internal structure
  - Change component size attrs (v2)
  - View 2 different sizes at once (v2)

Right Panels:
- Show hide right panel

- Page Details
  - Set title, metadesc, fb social media shit.
  - Set favicon
  - Set js snippet
  - Set global site snippet

- Attributes
  - Variables (V. 2)
  - Expose unique id of element so it can be selected by js.
  - Change component attributes (These attributes are not css BUT they must be able to statically compile to css)
  - Set attributes for specific states
  - Set specific breakpoints
  - Set transitions (V2)
  - Dropdowns of style guide choices
  - See where component is used (v2)

- Tree
  - See the page structure as a tree
  - Fold and unfold leaves
  - Rearrange nodes.

Element Fields:

All:
- State
- Position
  - Static
    - align-self
  - Absolute
    - x, y
- Width (min, default, max)
- Height (min, default, max)
- Padding
- Margin
- Background
- Border
- Shadow
- layer - z-index
- cursor (no)

Container:
- direction
  - row:
    - should wrap
- fill axis
- justify content
- align items
- Overflow

P, LI, H
- Font
- Font-Size
- Color
- Line Height
- Letter spacing
- Text align
- Weight
- underline, strike
- Italics/No

Image:





Drag and Drop:

Strategy:
Drop spots are rendered to the right of child elements in the direction of the flow.
First elements are against the beginning wall.
Drop spots need to be seperate from the layout to prevent shifting.


Algorithmn:
- Find all the drop spots from the items. - drop spots represented as 2 points [point,point]
- Compute the ones that are in range - closest point in radius
- Mark active and closest ones
- Render over the canvas

Edge Cases:
- Spaced out elements will look weird
- It might be nice for touching elements to expand and give way?
- 0 Width and height elements - and what about when they are nested?

Random idea:
- abstract data layout of the dom - not full look but not html - has some signifiers about how things are? Like half direct manipulation?? Some food for thought

TD:
- Fix fucked up drag preview
- Implement better drop display
- Get it working for reordering components

if time:
- Add make component - get that working
- Add save reload
