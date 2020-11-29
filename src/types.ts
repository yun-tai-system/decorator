export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export class ClassDecorator<O = any> {
    /**
     * 装饰器 配置项目
     */
    get options(): O {
        return this._options;
    }
    /**
     * 装饰器名字
     */

    get name(): string {
        return this._name;
    }
    constructor(private _name: string, private _options: O) { }

    toJson() {
        return {
            kind: 'ClassDecorator',
            name: this.name,
            options: this.options
        }
    }
}
export class MethodDecorator<O = any> {
    /**
    * 装饰器 配置项目
    */
    get options(): O {
        return this._options;
    }
    /**
     * 装饰器名字
     */
    get name(): string {
        return this._name;
    }

    get descriptor() {
        return this._descriptor;
    }

    get type() {
        return this._returnType
    }

    constructor(private _name: string, private _options: O, private _descriptor: TypedPropertyDescriptor<any>, private _returnType: any) { }

    toJson() {
        return {
            kind: 'MethodDecorator',
            name: this.name,
            options: this.options,
            descriptor: this.descriptor,
            type: this.type
        }
    }
}

export class ParameterDecorator<O = any> {
    /**
      * 装饰器 配置项目
      */
    get options(): O {
        return this._options;
    }
    /**
     * 装饰器名字
     */
    get name(): string {
        return this._name;
    }

    get type(): any {
        return this._type;
    }

    constructor(private _name: string, private _options: O, private _type: any) { }

    toJson() {
        return {
            kind: 'ParameterDecorator',
            name: this.name,
            options: this.options,
            type: this.type
        }
    }
}

export class OriginParameterDecorator extends ParameterDecorator {
    constructor(type: any) {
        super(`@noding/decorator OriginParameterDecorator`, {}, type)
    }
}
export class PropertyDecorator<O = any> {
    /**
      * 装饰器 配置项目
      */
    get options(): O {
        return this._options;
    }
    /**
     * 装饰器名字
     */
    get name(): string {
        return this._name;
    }

    get type(): any {
        return this._type;
    }

    constructor(private _name: string, private _options: O, private _type: any) { }

    toJson() {
        return {
            kind: 'PropertyDecorator',
            name: this.name,
            options: this.options,
            type: this.type
        }
    }
}
export class ObjectArray<T>{
    private map: Map<string, T[]> = new Map();
    constructor(private isEqual: (old: T, current: T) => boolean) { }
    get(key: string): T[] {
        if (this.map.has(key)) {
            return this.map.get(key) as T[];
        } else {
            const res: T[] = [];
            this.map.set(key, res);
            return res;
        }
    }
    add(key: string, arg: T) {
        const list = this.get(key);
        const item = list.find(it => this.isEqual(it, arg))
        if (!item) {
            list.push(arg);
        }
        this.map.set(key, list);
    }

    get size() {
        return this.map.size;
    }

    get values(): { [key: string]: T[] } {
        const obj: any = {}
        this.map.forEach((item, key) => {
            obj[key] = item.map(it => (it as any).toJson());
        });
        return obj;
    }
}

export class ObjectDecorator<T>{
    private map: Map<string, ObjectArray<T>> = new Map();
    constructor(private isEqual: (old: T, current: T) => boolean) { }
    get(key: string): ObjectArray<T> {
        if (this.map.has(key)) {
            return this.map.get(key) as ObjectArray<T>;
        } else {
            const res = new ObjectArray<T>(this.isEqual);
            this.map.set(key, res);
            return res;
        }
    }

    get size() {
        return this.map.size;
    }

    get values(): { [key: string]: T[] } {
        const obj: any = {}
        this.map.forEach((item, key) => {
            obj[key] = item.values;
        });
        return obj;
    }
}

export class ClassStore<T = any> {
    private _type: Type<T>;
    get type(): Type<T> {
        return this._type;
    }
    constructor(type: Type<T>) {
        this._type = type;
    }
    /**
     * 一个类有多个类装饰器
     */
    classes: ClassDecorator[] = [];
    /**
     * 一个类有多个方法，每个方法有多个方法装饰器
     */
    methods: ObjectArray<MethodDecorator> = new ObjectArray((old, current) => {
        return old.name === current.name
    });
    /**
     * 一个类有多个属性，每个方法有多个属性装饰器
     */
    properties: ObjectArray<PropertyDecorator> = new ObjectArray((old, current) => {
        return old.name === current.name
    });
    /**
     * 方法参数 包括constructor
     */
    parameters: ObjectDecorator<ParameterDecorator> = new ObjectDecorator((old, current) => {
        return old.name === current.name
    });

    toJson() {
        return {
            classes: this.classes.map(it => it.toJson()),
            methods: this.methods.values,
            properties: this.properties.values,
            parameters: this.parameters.values
        }
    }

    get values() {
        return this.toJson()
    }
}

export class DecoratorStore {
    static record: Map<Type<any>, ClassStore> = new Map();
    static get<T>(type: Type<T>): ClassStore<T> {
        if (this.record.has(type)) {
            return this.record.get(type) as ClassStore<T>;
        } else {
            const res = new ClassStore(type);
            this.set(type, res);
            return res;
        }
    }
    static set<T>(type: Type<T>, cls: ClassStore<T>) {
        this.record.set(type, cls)
    }
}
