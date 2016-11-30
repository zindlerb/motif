# Flexbox quirks:
- 3 items 2 with declared width 1 without will treat all 3 as if their widths are not declared.
- additionally because there is a flex shrink set the width will shrink if the width is declared.... v confusing

How to control who shrinks?


https://kyusuf.com/post/almost-complete-guide-to-flexbox-without-flexbox
would be good for transpiling to older browsers or for better perf.

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

What properties in css are related? Dependent on other properties?
What properties can be applied to each element

auto width and margin dependent on position.

Absolute should always be relative to parent


