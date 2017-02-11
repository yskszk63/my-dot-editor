import {EventEmitter} from './EventEmitter';

export class Model extends EventEmitter {
    constructor(source="", engine="dot") {
        super();
        this._source = source;
        this._engine = engine;
    }
    get source() {
        return this._source;
    }
    set source(val) {
        this._source = val;
        this.dispatch('change');
    }
    get engine() {
        return this._engine;
    }
    set engine(val) {
        this._engine = val;
        this.dispatch('change');
    }
    get state() {
        return this._state;
    }
    set state(val) {
        this._state = val;
        this.dispatch('state_changed');
    }
    get result() {
        return this._result;
    }
    set result(val) {
        this._result = val;
        delete this._error;
        this.state = 'success';
    }
    get error() {
        return this._error;
    }
    set error(val) {
        delete this._result;
        this._error = val;
        this.state = 'error';
    }
}