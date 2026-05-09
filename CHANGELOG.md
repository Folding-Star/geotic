# v5.0.2

* Fix an erroneous Typescript signature for `world.serialize`

# v5.0.1

* Expose more types in the main `geotic` export, including an `EntityType` that explicitly allows top-level component access, and `SerializedEntity`
* Add a `get` function to `Entity` to retrieve components by their class. This was added so that IDEs can more easily generate working code when renaming components.

# v5.0.0

New major version to distinguish from the parent.

* Converted source code to use Typescript. 
* Added a new `onBeforeDestroy` event to components that can be used to do cleanup that relies upon the entity's state being preserved. This is mostly useful in cases where an entity might be destroyed and components rely on others.
* Removed `rollup` and added `esbuild` as the build library (entirely for personal preference)
* Updated tests - I'm not sure if the new behavior was a change from using TS or an error in the test, but they were failing `serialization` tests by serializing a deeply nested object that wasn't in the expected object. This fixes them.

# v4.3.2

This is the original version of `geotic` forked from https://github.com/ddmills/geotic.

