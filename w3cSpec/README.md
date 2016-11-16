# W3C Spec

What makes css hard?
- Non local reasoning. Have to think about the whole document. There may be something out there.

Confusing CSS Things:

- Auto behavior on any element
- Margin collapsing
- How will things resize as the width changes





Inline Block:
How does it really work?


How to make positioning understandable?
How to make low level text editing understandable?

Line height is like vertical padding for inline elements
Line height:
- used to determine line box height starting from baseline
Leading = Line Height - Ascender + Descender 

In css what does font size really measure?
- Top of the capital letter to the bottom of the lowest descender



Glossary:

content-edge:

What is diff between:

block-container-box: 
A block container box either contains only block-level boxes or establishes an inline formatting context and thus contains only inline-level boxes.

block-box:
block-level-block:

line box:
Horizontal line for inline elements. 

Anon Box:
Box set by the browser not html doc

Q's:
What is replaced vs. non replaced?

Huh?

Although margins, borders, and padding of non-replaced elements do not enter into the line box calculation, they are still rendered around inline boxes. This means that if the height specified by 'line-height' is less than the content height of contained boxes, backgrounds and colors of padding and borders may "bleed" into adjoining line boxes. User agents should render the boxes in document order. This will cause the borders on subsequent lines to paint over the borders and text of previous lines.


Simplifications:

No inline blocks
2 types of positioning
no floats
powerful rich text model that includes floats... for positioning around images

components over inheritance

How is text in css described?

What are the defaults of width under flexbox conditions?

How to visualize:
- Flow in multiple widths
- Margin padding
- Heirarchy - how to grab the correct elements


Annoying/bad mental model things
- divs are 0/0 by default
- Grow and shrink factor are kind of confusing...
shrink seems to be the proportion it shrinks by relative to the others...
Can set the width as percentage and have shrinking how does that work?

Mental model of real css:
Regular widths expand to fit the content. The height is a function of content. No content no height
- Kinda want to remove all autos. They are almost allways special cases. Could shore up with postitioning snapping.
http://www.hongkiat.com/blog/css-margin-auto/

http://stackoverflow.com/questions/17468733/difference-between-width-auto-and-width-100-percent

For an element. What are all the default values?

Possible adjustments to real css:


Big open q now is do I create a layer between real css or a tool for helping understand css?

- more power not constraining and conceptually simpler
- less powerful direct manipulations

What proph
