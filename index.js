
module.exports = UndoManager;

function UndoManager()
{
    this._index = 0;
    this._actions = [];

    this._groupedActions = [];
    this._groupingLevel = 0;

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
        this._executeAction();
        this.isUndoing = false;
    },

    redo: function()
    {
        if (!this.canRedo)
            return;

        this._index++;

        this.isRedoing = true;
        this._executeAction();
        this.isRedoing = false;

        if (this._index === this._actions.length - 1) {
            this._actions.pop();
            this._index--;
        }
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
        if (this.shouldIgnoreRegisterCalls)
            return;

        var fun = function() {
            target[propertyName] = value;
        };
        fun.value = value;
        this.registerFunctionUndo(fun);
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

        if (this._groupingLevel > 0)
            this._groupedActions.push(fun);
        else
            this._registerAction(fun);
    },

    _registerAction: function(action)
    {
        if (this.canRedo)
            this._actions.splice(this._index, Number.MAX_VALUE);

        this._index = this._actions.push(action);
        if (this.isUndoing)
            this._index -= 2;
    },

    _executeAction: function()
    {
        var action = this._actions[this._index];
        if (typeof action === "function")
            action();
        else if (Array.isArray(action)) {
            (this.isUndoing ? action.slice().reverse(): action).forEach(function(groupedAction) {
                groupedAction();
            });
        }
    }
};
