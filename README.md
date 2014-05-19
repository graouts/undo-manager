undo-manager
============

A JavaScript object to manage your undo/redo stack.

## Installation

Install with [component](http://component.io):

    $ component install graouts/undo-manager

Or standalone using one of the [releases](https://github.com/graouts/undo-manager/releases).

## Usage

First, create an instance:

```javascript
var UndoManager = require("undo-manager");
var manager = new UndoManager();
```

And then interact with the undo stack with calls to:

```javascript
manager.undo();
```

and…

```javascript
manager.redo();
```

When you're calling code that would enter a state you would like to be able to undo, you need to call one of the three registration methods, `registerPropertyUndo`, `registerMethodUndo` and `registerFunctionUndo`. For instance, say you're within a property setter: 

```javascript
Object.defineProperty(anObject, "foo", {
    set: function(foo)
    {
        manager.registerPropertyUndo(this, "foo", this._foo);
        this._foo = foo;
    }
});
```

… or a function that sets a property:

```javascript
MyClass.prototype.setFoo = function(foo)
{
    manager.registerMethodUndo(this, this.setFoo, this._foo);
    this._foo = foo;
}
```

… or simple want to revert a method call:

```javascript
function deleteFile(file)
{
    manager.registerFunctionUndo(function() {
        addFile(file);
    });
    // … function code to delete file.
}
```

You can also group a series of undo registrations into groups such that all registered actions are undone and redone together. For instance, say you implement some code to drag an element on screen, you would first `manager.beginGroup()` as you process the `mousedown` event, and then `manager.endGroup()` as you process the `mouseup` event. Undo groups support nesting.

## API

#####.canUndo

A `bool` value indicating whether the undo stack has any registered action on it to undo.

#####.canRedo

A `bool` value indicating whether the undo stack has any registered action on it to redo.

#####.undo()

Closes the top-level undo group if necessary and performs the next logical undo operation.

#####.redo()

Performs the next logical redo operation.

#####.beginGroup()

Marks the beginning of an undo group. All individual undo operations before a subsequent call to `endGroup()` call are grouped together and reversed by a later `undo()` call.

#####.endGroup()

Marks the end of an undo group. All individual undo operations back to the matching `beginGroup()` call are grouped together and reversed by a later `undo()` call.

#####.registerPropertyUndo(*target*, *propertyName*, *value*)

Records a single undo operation so that when an undo is performed the specified `propertyName` on the `target` is reset to the provided `value`.

#####.registerMethodUndo(*target*, *method*, *[, arg1[, arg2[, ...]]]*)

Records a single undo operation so that when an undo is performed the specified `method` is called on the `target` as the `this` object and any additional arguments are passed during the undo operation.

#####.registerFunctionUndo(*func*)

Records a single undo operation so that when an undo is performed, the provided function is called.
