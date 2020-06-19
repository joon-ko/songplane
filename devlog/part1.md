june 19, 2020

## devlog for songplane

i haven't done a devlog before, but it's something i've seen some of my friends do and i think it'll be interesting to read looking back!

### motivation / idea

while dozing off at my desk watching pikmin speedruns such as [this one](https://www.youtube.com/watch?v=5jxiAZm6jyY), i had the idea of having an infinitely scrollable 2d plane that was made up of tiles, like oversized pixels. like [/r/place](https://www.reddit.com/r/place/), each tile could be edited with a color, but also with a musical note. basically, augmenting the medium that was /r/place with an aural mode.

you could connect the tiles together somehow and then drop some sort of indicator, like a marble, onto a tile, which bounces from tile to tile, playing a melody.

i'm deciding to use go and typescript since i need to learn both for a job i'm moving to boston for in less than two weeks. i spent most of yesterday learning about go's [net/http](https://golang.org/pkg/net/http/) package and doing their well-written tutorial on [web apps](https://golang.org/doc/articles/wiki/). i'm using [gin](https://github.com/gin-gonic/gin), a web framework that has nice logging middlewware, and also my job uses it.

### cameras, coordinate axes, and canvas (oh my!)

<img src="images/1-1.png" width="400"/>
<img src="images/1-2.png" width="400"/>

before writing a single line of code, i spent a while doodling in my notebook on how the math for this was going to work out. the hardest thing to work my head around was the number of different coordinate systems i was using. the website itself is going to be one canvas, in which positive x is right, and positive y is down. but we're used to positive y being up, since that was what we were taught in school. so my goal is to have any externally displayed coordinates to be 'real' coordinates, but when specifying coordinates for a canvas context to draw, those need to be translated into 'canvas' coordinates, where y is down.

also, blocks have their own 'block' coordinate system, which is oriented the same way as the 'real' system, except blocks are 100px by 100px and the block represented by coordinate `(i, j)` is centered at `(100i, 100j)`. there need to be functions that translate from one to the other: for example, the 'real' coordinate `(234, 567)` would be 'block' coordinate `(2, 6)`.

there's also the concept of the 'camera' which is always positioned in the center of the browser. the camera's position determines which tiles need to get rendered.

after hacking out the details on ink, i finally wrote the initial server code and wrote enough on the client-side to be able to display (what seems to be) an infinitely-scrolling plane, with the block coordinate printed on each block, and the ability to move around with the camera by either click-and-dragging, or using the arrow keys.

<img src="images/1-3.gif" width="400"/>
