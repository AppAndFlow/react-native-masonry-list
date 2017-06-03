# @appandflow/masonry-list

[![npm (scoped)](https://img.shields.io/npm/v/@appandflow/masonry-list.svg)](https://www.npmjs.com/package/@appandflow/masonry-list) [![Travis branch](https://img.shields.io/travis/AppAndFlow/react-native-masonry-list/master.svg)](https://travis-ci.org/AppAndFlow/react-native-masonry-list)

Allows creating masonry style list layouts in a performant way.

This component leverages `FlatList` to render performant masonry layout lists. The
main caveat right now is that it doesn't support measuring cells (yet) so you need to be
able to provide the dimensions.

![](blob:http://imgur.com/c9ff3a44-7991-417b-8214-2b68aa8335e5)

## Installation

`yarn add @appandflow/masonry-list`

## Usage

`import MasonryList from '@appandflow/masonry-list';`

## Props

This component supports most of the props of `FlatList` plus a few extras one:

#### `getHeightForItem: ({ item: any, index: number }) => number,`

Returns the height for a specific item. Note that this it *not* optional for now.

#### `numColumns: number`

The number of columns.

#### `renderItem: ({ item: any, index: number, column: number }) => ?ReactElement<*>,`

Same as `renderItem` from `FlatList` but also gets passed the column index.

## Example

Play with on [Expo](https://exp.host/@appandflow/masonry-list-example)

Take a look at [example folder](https://github.com/AppAndFlow/react-native-masonry-list/blob/master/example)

## TODO

- Support measuring items automatically and get rid of `getHeightForItem`.

- Implement onEndReached in a way that it isn't called multiple times.

- Support FooterComponent.

- Long term, could probably be implemented without using multiple `VirtualizedList`
to make it more performant and less hacky.
