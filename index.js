
module.exports = UndoManager;

function UndoManager()
{
    this._index = 0;
    this._actions = [];

    this.isUndoing = false;
    this.isRedoing = false;
}

UndoManager.prototype = {
    constructor: UndoManager,

    get canUndo()
    {
        return this._index > 0;
    },

    get canRedo()
    {
        return this._index < this._actions.length - 1;
    },

    get shouldIgnoreRegisterCalls()
    {
        return (this.isRedoing || (this.isUndoing && this.canRedo));
    },

    undo: function()
    {
        if (!this.canUndo)
            return;
    
        this._index--;

        this.isUndoing = true;
        this._actions[this._index]();
        this.isUndoing = false;
    },

    redo: function()
    {
        if (!this.canRedo)
            return;

        this._index++;

        this.isRedoing = true;
        this._actions[this._index]();
        this.isRedoing = false;
    },

    registerPropertyUndo: function(target, propertyName, value)
    {
        if (this.shouldIgnoreRegisterCalls)
            return;

        this.registerFunctionUndo(function() {
            target[propertyName] = value;
        });
    },

    registerMethodUndo: function(target, method)
    {
        if (this.shouldIgnoreRegisterCalls)
            return;
        var args = Array.prototype.slice.call(arguments, 2);
        this.registerFunctionUndo(function() {
            method.apply(target, args);
        });
    },

    registerFunctionUndo: function(fun)
    {
        if (this.shouldIgnoreRegisterCalls)
            return;

        if (this.canRedo)
            this._actions.splice(this._index, Number.MAX_VALUE);

        this._index = this._actions.push(fun);
        if (this.isUndoing)
            this._index -= 2;
    }

};
