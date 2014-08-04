
module.exports = UndoManager;

function UndoManager()
{
    this._undoStack = [];
    this._redoStack = [];

    this._groupedActions = [];
    this._groupingLevel = 0;

    this._isUndoing = false;
    this._isRedoing = false;
}

UndoManager.prototype = {
    constructor: UndoManager,

    // Public

    get canUndo()
    {
        return this._undoStack.length > 0;
    },

    get canRedo()
    {
        return this._redoStack.length > 0;
    },

    undo: function()
    {
        if (!this.canUndo)
            return;

        while (this._groupingLevel)
            this.endGroup();

        this._isUndoing = true;
        this.beginGroup();
        this._executeAction(this._undoStack.pop());
        this.endGroup();
        this._isUndoing = false;
    },

    redo: function()
    {
        if (!this.canRedo)
            return;

        this._isRedoing = true;
        this.beginGroup();
        this._executeAction(this._redoStack.pop());
        this.endGroup();
        this._isRedoing = false;
    },

    beginGroup: function()
    {
        this._groupingLevel++;
    },

    endGroup: function()
    {
        if (!this._groupingLevel)
            return;
        
        this._groupingLevel--;

        if (this._groupingLevel > 0)
            return;

        this._registerAction(this._groupedActions);
        this._groupedActions = [];
    },

    registerPropertyUndo: function(target, propertyName, value)
    {
        this.registerFunctionUndo(function() {
            target[propertyName] = value;
        });
    },

    registerMethodUndo: function(target, method)
    {
        var args = Array.prototype.slice.call(arguments, 2);
        this.registerFunctionUndo(function() {
            method.apply(target, args);
        });
    },

    registerFunctionUndo: function(fun)
    {
        if (this._groupingLevel > 0)
            this._groupedActions.push(fun);
        else
            this._registerAction(fun);
    },

    // Private

    _registerAction: function(action)
    {
        if (this._isUndoing)
            this._redoStack.push(action);
        else {
            this._undoStack.push(action);
            if (!this._isRedoing)
                this._redoStack = [];
        }
    },

    _executeAction: function(action)
    {
        if (typeof action === "function")
            action();
        else if (Array.isArray(action)) {
            while (action.length)
                action.pop()();
        }
    }
};
