import { Type } from "@angular/core";
import "reflect-metadata";
import * as meepo from './types';
const decoratorKey = Symbol.for(`decorator`)
export const getDesignType = (target: any, propertyKey: PropertyKey) =>
    Reflect.getMetadata('design:type', target, propertyKey as any);
export const getDesignParamTypes = (target: any, propertyKey?: PropertyKey) =>
    Reflect.getMetadata('design:paramtypes', target, propertyKey as any);
export const getDesignTargetParams = (target: any) =>
    Reflect.getMetadata('design:paramtypes', target);
export const getDesignReturnType = (target: any, propertyKey: PropertyKey) =>
    Reflect.getMetadata('design:returntype', target, propertyKey as any);
function makeMetadataCtor(props?: (...args: any[]) => any): any {
    return function ctor(this: any, ...args: any[]) {
        if (props) {
            const values = props(...args);
            for (const propName in values) {
                this[propName] = values[propName];
            }
        }
    };
}
export function noSideEffects<T>(fn: () => T): T {
    return { toString: fn }.toString() as unknown as T;
}
export function createClassDecorator<T>(
    name: string,
    props?: (...args: any[]) => any,
    parentClass?: any,
    additionalProcessing?: (type: Type<any>) => void,
    typeFn?: (type: Type<any>, ...args: any[]) => void
): T {
    return noSideEffects(() => {
        const metaCtor = makeMetadataCtor(props);
        function DecoratorFactory(
            this: unknown | typeof DecoratorFactory,
            ...args: any[]
        ): (cls: Type<any>) => any {
            if (this instanceof DecoratorFactory) {
                metaCtor.call(this, ...args);
                return this as typeof DecoratorFactory;
            }
            return function TypeDecorator(cls: Type<any>) {
                if (typeFn) typeFn(cls, ...args);
                const decorator = meepo.DecoratorStore.get(cls);
                const parameters = getDesignTargetParams(cls) || [];
                decorator.classes.push(
                    new meepo.ClassDecorator(name, ...args)
                );
                parameters.map((item: any, index: number) => {
                    const parameter = decorator.parameters.get(`constructor`);
                    parameter.add(`${index}`, new meepo.OriginParameterDecorator(item))
                });
                Reflect.set(cls, decoratorKey, decorator.toJson())
                if (additionalProcessing) additionalProcessing(cls);
                return cls;
            };
        }
        if (parentClass) {
            DecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        DecoratorFactory.prototype.ngMetadataName = name;
        (DecoratorFactory as any).annotationCls = DecoratorFactory;
        return DecoratorFactory as any;
    });
}
export function createPropertyDecorator<T>(
    name: string,
    props?: (...args: any[]) => any,
    parentClass?: any,
    additionalProcessing?: (type: Type<any>, property: any) => void
): T {
    return noSideEffects(() => {
        const metaCtor = makeMetadataCtor(props);
        function PropDecoratorFactory(
            this: unknown | typeof PropDecoratorFactory,
            ...args: any[]
        ): (cls: Type<any>, property: any) => any {
            if (this instanceof PropDecoratorFactory) {
                metaCtor.call(this, ...args);
                return this as typeof PropDecoratorFactory;
            }
            return function PropDecorator(target: any, property: any) {
                const type = target.constructor;
                const decorator = meepo.DecoratorStore.get(type);
                const types = getDesignType(target, property);
                decorator.properties.add(property, new meepo.PropertyDecorator(name, types, ...args))
                Reflect.set(type, decoratorKey, decorator.toJson())
                if (additionalProcessing) additionalProcessing(type, property);
            };
        }
        if (parentClass) {
            PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        PropDecoratorFactory.prototype.ngMetadataName = name;
        (PropDecoratorFactory as any).annotationCls = PropDecoratorFactory;
        return PropDecoratorFactory as any;
    });
}
export function createParameterDecorator<O>(
    name: string,
    props?: (...args: any[]) => any,
    parentClass?: any,
    additionalProcessing?: (type: Type<any>, property: any, index: number) => void
): O {
    return noSideEffects(() => {
        const metaCtor = makeMetadataCtor(props);
        function ParameterDecoratorFactory(
            this: unknown | typeof ParameterDecoratorFactory,
            ...args: any[]
        ): (cls: Type<any>, property: any, index: number) => any {
            if (this instanceof ParameterDecoratorFactory) {
                metaCtor.call(this, ...args);
                return this as typeof ParameterDecoratorFactory;
            }
            return function ParameterDecorator(target: any, property: any, index: number) {
                let type = target;
                const key = property || 'constructor';
                let types: any[] = [];
                if (property) {
                    type = target.constructor;
                    types = getDesignParamTypes(target, property);
                } else {
                    types = getDesignTargetParams(target)
                }
                const decorator = meepo.DecoratorStore.get(type);
                const constructorDecorator = decorator.parameters.get(key)
                constructorDecorator.add(`${index}`, new meepo.ParameterDecorator(name, types[index], ...args));
                Reflect.set(type, decoratorKey, decorator.toJson())
                if (additionalProcessing) additionalProcessing(type, property, index);
            };
        }
        if (parentClass) {
            ParameterDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        ParameterDecoratorFactory.prototype.ngMetadataName = name;
        (ParameterDecoratorFactory as any).annotationCls = ParameterDecoratorFactory;
        return ParameterDecoratorFactory as any;
    });
}
export function createMethodDecorator<O>(
    name: string,
    props?: (...args: any[]) => any,
    parentClass?: any,
    additionalProcessing?: (type: Type<any>, property: any, descriptor: TypedPropertyDescriptor<any>) => void
): O {
    return noSideEffects(() => {
        const metaCtor = makeMetadataCtor(props);
        function MethodDecoratorFactory(
            this: unknown | typeof MethodDecoratorFactory,
            ...args: any[]
        ): (cls: Type<any>, property: any, descriptor: TypedPropertyDescriptor<any>) => any {
            if (this instanceof MethodDecoratorFactory) {
                metaCtor.call(this, ...args);
                return this as typeof MethodDecoratorFactory;
            }
            return function MethodDecorator(target: any, property: any, descriptor: TypedPropertyDescriptor<any>) {
                const type = target.constructor;
                const decorator = meepo.DecoratorStore.get(type);
                const types = getDesignReturnType(target, property);
                decorator.methods.add(property, new meepo.MethodDecorator(name, descriptor, types, ...args));
                Reflect.set(type, decoratorKey, decorator.toJson())
                if (additionalProcessing) additionalProcessing(type, property, descriptor);
            };
        }
        if (parentClass) {
            MethodDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        MethodDecoratorFactory.prototype.ngMetadataName = name;
        (MethodDecoratorFactory as any).annotationCls = MethodDecoratorFactory;
        return MethodDecoratorFactory as any;
    });
}
export function createDecorator<O>(
    name: string,
    props?: (...args: any[]) => any,
    parentClass?: any,
    additionalProcessing?: (type: Type<any>) => void,
    typeFn?: (type: Type<any>, ...args: any[]) => void
): O {
    return noSideEffects(() => {
        const metaCtor = makeMetadataCtor(props);
        function AnyDecoratorFactory(
            this: unknown | typeof AnyDecoratorFactory,
            ...args: any[]
        ): (cls: any, property?: any, index?: any) => any {
            if (this instanceof AnyDecoratorFactory) {
                metaCtor.call(this, ...args);
                return this as typeof AnyDecoratorFactory;
            }
            return function AnyDecorator(target: any, property?: any, index?: any) {
                if (property) {
                    // method or property
                    if (typeof index === 'number') {
                        // params
                        return createParameterDecorator<any>(name, props, parentClass, additionalProcessing)(...args)(target, property, index)
                    }
                    else if (index) {
                        return createMethodDecorator<any>(name, props, parentClass, additionalProcessing)(...args)(target, property, index)
                    }
                    return (createPropertyDecorator<any>(name, props, parentClass, additionalProcessing) as any)(...args)(target, property)
                }
                if (typeof index === 'number') {
                    // constructor
                    return createParameterDecorator<any>(name, props, parentClass, additionalProcessing)(...args)(target, property, index)
                }
                return createClassDecorator<any>(name, props, parentClass, additionalProcessing, typeFn)(...args)(target);
            };
        }
        if (parentClass) {
            AnyDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        AnyDecoratorFactory.prototype.ngMetadataName = name;
        (AnyDecoratorFactory as any).annotationCls = AnyDecoratorFactory;
        return AnyDecoratorFactory as any;
    });
}
export interface IClassDecorator {
    kind: 'ClassDecorator', name: string, args: any[]
}
export interface IMethodDecorator {
    kind: 'MethodDecorator', name: string, args: any[], type: any
}
export interface IPropertyDecorator {
    kind: 'PropertyDecorator', name: string, args: any[], type: any
}
export interface IParameterDecorator {
    kind: 'ParameterDecorator', name: string, args: any[], type: any
}
export function getDecorator(type: meepo.Type<any>): {
    classes: IClassDecorator[],
    methods: { [key: string]: IMethodDecorator[] },
    properties: { [key: string]: IPropertyDecorator[] },
    parameters: { [key: string]: IParameterDecorator[] }
} {
    return Reflect.get(type, decoratorKey) || {
        classes: [],
        methods: [],
        properties: [],
        parameters: []
    }
}
