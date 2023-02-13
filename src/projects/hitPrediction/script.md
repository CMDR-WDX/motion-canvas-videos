# Hit Prediction

## Intro

This video is going to be a bit math-heavy.  
But don't worry, you should be able to understand the core concepts without
having a deep understanding of linear algebra.

First of all… what do I mean by "Hit Prediction".

If you have been following my channel, you might be aware that I play Elite:
Dangerous, a space sim based on newtonian physics which also has
projectile-based combat.

In Elite, when you try to shoot another target, the game will give you an
indicator of where you have to shoot for the weapons to hit — assuming that the
target does not change directions. Another space game, Star Citizen, also has
that feature.

This will video will explore how one would go about implementing projectile
predictions.

## The Problem

First, let's try to define what we actually want to achieve.

We have our ship, we have a gun on our ship that can fire in all directions by
turning the ship, and we have an enemy we want to hit.

Our main objective here it find the _direction_ we need to shoot to be able to
hit a moving target, assuming it doesn't change its direction.

We know our own speed and position, the enemies speed and position, and our
gun's shot speed.

### Simplifying the Problem

Let's, for a second, assume that our ship is not moving at all, and that our gun
doesn't just fire straight forward, but into all directions, at the same time.

You will quickly notice that a "ring" of bullets emerges from our ship. We can
abstract all these bullets away as a simple circle expanding from our ship.

If that circle touches our Enemy, we have a hit. In other words, when the
distance between the enemy and our ship is equal to the circle's radius, we get
a collision.

This way we cannot find out **where** the collision takes place, but we do know
**when** it happens.

But because we know where the enemy started and where it is flying towards, we
can also calculate **Where** the collision takes place.

### Problem: Moving Ship

There is one flaw here, however.

The Bullet inherits our ship's momentum – meaning… that if the ship is… say …
flying to the side, the bullet will also fly to the side, even if it was flying
straight up.

Similarly, if the ship flying in reverse, the bullet's speed will be slower.

This way, bullets no longer form a circle, but an ellipse — which means you
cannot just use the distance between our ship and the enemy.

There is however a simple trick to this: Changing the Frame of Reference.

The ellipse happens because we are looking at the bullets direction **relative
to the world**.

A simple solution is to look at the bullet **relative to our ship**.  
For this, we just have to subtract the position and direction of our ship from
every actor.

And that is it… the problem of a moving ship is no more, because in our new
frame of reference, our ship is not moving.

### Math

Soo.. back to the problem…

We want to find out **when** the circle representing all possible bullets
collides with the Enemy.

For this we basically need to look at when the distance between our ship and the
Enemy is the same as the distance between the circle and our ship.

The _Pythagorean theorem_ is a simple way of figuring out the distance between
two points. By taking the difference between two positions, multiplying each
component of the vector with itself, and then taking the root of the sum, you
get the distance.

We can figure out where the Enemy is at a certain time by adding its starting
position and the travel direction multiplied with the time passed.

To get the distance of our bullet at a given time we can just multiply its speed
with the passed time.

And this is how we get the following function:

[...]

There is one optimization we can do however. Calculating the square root is
expensive. We should, if possible, avoid them.

In this specific instance we do not _really_ care about the exact distances. We
just need to know when they are identical.

Square Root is an invertible function — which just means that for every output
that can only be one input.

If you look at x^2 for example, you can see that any y can have up to two
x-Values mapped to it. You could turn it into an invertible function by just
looking at either the positive, or negative side.

We basically check where the squared distances are equal, or, in other words,
where the difference between the two distances is zero.

And that is it. Now we just have to resolve this function for the time.

We will do so by painfully resolving the function by han(... cutoff) Wolfram..
just use Wolfram.

And boom… here is our function. Actually.. function**s**. You get two of them…
which makes sense if you look at the graph.

We only care about the first result though.

Soo.. now all you have to do is insert all the constants and boom… (_gets a bad
result_)

## Edge Case

Imagine you have a very slow bullet, in fact so slow that the enemy can outrun
it.

In this instance the function will _never_ have a result. You can tell when
there is no result by checking the value inside the square root. If whatever is
inside is negative you do not have a solution.

## Getting the position

soo.. if you got a result, you now have the time of collision. Because you know
the Enemies position and their current direction, you can multiply the direction
with the time and add their position.

And there you go... you found the point of collision.

## 3D

There is one thing however... This entire video focuses on 2D. Elite and Star
Citizen are, however, in 3D.

Well... 3D works just like 2D, you just need to add the new dimension whenever
applicable.

## Code

This video is getting long… instead of going into detail, check the description.
You will find a commented implementation you can use.

# Outro

This video is a bit different from my previous ones. Instead of using After
Effects like I normally would, I tried out Motion Canvas.

Motion Canvas uses code to declare animations in scenes. If you are interested,
you can find a link to both motion canvas and the source code to this video in
the Description.
